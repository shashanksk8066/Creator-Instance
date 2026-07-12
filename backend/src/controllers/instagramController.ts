import { Request, Response } from 'express';
import { db } from '../config/firebase';
import axios from 'axios';

// Get Meta settings securely
const getMetaConfig = async () => {
  const doc = await db.collection('platform_settings').doc('meta_config').get();
  if (!doc.exists) throw new Error('Meta settings not configured');
  return doc.data();
};

export const generateAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getMetaConfig();
    const appId = config?.appId;
    const redirectUri = config?.oauthRedirectUri || `${req.protocol}://${req.get('host')}/api/instagram/callback`;
    
    // Scopes needed for basic info and messaging, matching Meta's exact requirements
    const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments';
    
    // Store user id in state to link account on callback
    const state = req.user?.uid;

    if (!appId || !state) {
      res.status(400).json({ error: 'App ID missing or user not authenticated' });
      return;
    }

    const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

    res.json({ url: authUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error, error_reason, error_description } = req.query;

    if (error) {
      console.error('Instagram auth error:', error_reason, error_description);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/dashboard/auto-dm?error=${error_description}`); // Fallback local redirect for now
      return;
    }

    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state' });
      return;
    }

    const uid = state as string;
    const config = await getMetaConfig();
    const appId = config?.appId;
    const appSecret = config?.appSecret;
    const redirectUri = config?.oauthRedirectUri || `${req.protocol}://${req.get('host')}/api/instagram/callback`;

    // 1. Exchange code for short-lived access token
    const tokenForm = new URLSearchParams();
    tokenForm.append('client_id', appId);
    tokenForm.append('client_secret', appSecret);
    tokenForm.append('grant_type', 'authorization_code');
    tokenForm.append('redirect_uri', redirectUri);
    let authCode = code as string;
    if (authCode.endsWith('#_')) {
      authCode = authCode.replace('#_', '');
    }

    tokenForm.append('code', authCode);

    console.log('\n--- STARTING INSTAGRAM AUTH FLOW ---');
    console.log('Redirect URI hit with full URL:', req.originalUrl);
    console.log('Code extracted:', authCode);

    console.log('\n1. Calling POST https://api.instagram.com/oauth/access_token');
    console.log('Parameters:', {
      client_id: appId,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      // intentionally omit code/secret for security
    });

    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', tokenForm);
    console.log('RAW Step 1 Response:', JSON.stringify(tokenResponse.data, null, 2));

    let accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
        throw new Error('Access token not found in the response');
    }

    console.log('\n2. Calling GET https://graph.instagram.com/v25.0/access_token');
    // 2. Exchange for long-lived access token
    let expiryDate = new Date(Date.now() + 3600 * 1000).toISOString(); 

    try {
      const longLivedResponse = await axios.get('https://graph.instagram.com/v25.0/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: appSecret,
          access_token: accessToken
        }
      });

      console.log('RAW Step 2 (Long-Lived) Response:', JSON.stringify(longLivedResponse.data, null, 2));
      accessToken = longLivedResponse.data.access_token || accessToken;
      const expiresIn = longLivedResponse.data.expires_in || 3600; // in seconds
      expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString(); 
      console.log('Successfully exchanged for long-lived token.');
    } catch (tokenExchangeError: any) {
      console.error('Long-lived token exchange failed, falling back to initial token:', tokenExchangeError.response?.data || tokenExchangeError.message);
      // We fall back to using the initial token (which might already be long-lived if from a newer API flow)
    }

    console.log('\n3. Calling GET https://graph.facebook.com/v25.0/debug_token');
    
    try {
      const debugTokenResponse = await axios.get(`https://graph.facebook.com/v25.0/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: `${appId}|${appSecret}`
        }
      });
      console.log('Debug Token Info:', debugTokenResponse.data.data);
    } catch (debugErr: any) {
      console.error('Debug token failed:', debugErr.response?.data || debugErr.message);
    }

    console.log('\n4. Calling GET https://graph.instagram.com/v25.0/me');
    console.log('Parameters:', { fields: 'user_id,username' });
    // 3. Fetch user profile
    const profileResponse = await axios.get('https://graph.instagram.com/v25.0/me', {
      params: {
        fields: 'user_id,username',
        access_token: accessToken
      }
    });

    console.log('RAW Step 4 (/me) Response:', JSON.stringify(profileResponse.data, null, 2));

    const profileData = profileResponse.data.data ? profileResponse.data.data[0] : profileResponse.data;

    const instagramData = {
      accountId: profileData.user_id || profileData.id,
      username: profileData.username,
      accessToken,
      tokenExpiry: expiryDate
    };

    // 4. Save to user document
    const accountId = instagramData.accountId;
    await db.collection('users').doc(uid).set({
      instagramAccounts: {
        [accountId]: instagramData
      }
    }, { merge: true });

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard/auto-dm?success=true`);
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard/auto-dm?error=auth_failed`);
  }
};

export const getMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const accountId = req.query.accountId as string;

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!accountId) {
      res.status(400).json({ error: 'Missing accountId parameter' });
      return;
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const instagramAccounts = userDoc.data()?.instagramAccounts || {};
    const account = instagramAccounts[accountId];

    if (!account || !account.accessToken) {
      res.status(400).json({ error: 'Instagram account not found or not connected' });
      return;
    }

    let allMedia: any[] = [];
    let nextUrl: string | null = `https://graph.instagram.com/me/media`;
    let params: any = {
      fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
      access_token: account.accessToken,
      limit: 100
    };

    while (nextUrl && allMedia.length < 500) {
      const apiResponse: any = await axios.get(nextUrl, { params });
      const data = apiResponse.data.data;
      if (data && data.length > 0) {
        allMedia = allMedia.concat(data);
      }
      nextUrl = apiResponse.data.paging?.next || null;
      params = {}; // the nextUrl from Instagram already contains all needed tokens and cursors
    }

    res.json(allMedia);
  } catch (error: any) {
    console.error('Fetch media error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram media' });
  }
};

export const disconnectAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { accountId } = req.body;

    if (!uid || !accountId) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const instagramAccounts = userDoc.data()?.instagramAccounts || {};

    if (instagramAccounts[accountId]) {
      // Remove account from map
      delete instagramAccounts[accountId];
      await userRef.update({ instagramAccounts });

      // Delete all auto dm rules associated with this account
      const rulesSnapshot = await db.collection('auto_dm_rules')
        .where('creatorId', '==', uid)
        .where('accountId', '==', accountId)
        .get();

      const batch = db.batch();
      rulesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    res.json({ message: 'Account disconnected successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userDoc = await db.collection('users').doc(uid).get();
    const instagramAccounts = userDoc.data()?.instagramAccounts || {};
    res.json(instagramAccounts);
  } catch (error: any) {
    console.error('Error fetching Instagram accounts:', error.message);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};
