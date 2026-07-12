import { auth, db } from './src/config/firebase';

const createAdmin = async () => {
  try {
    const email = 'admin@gmail.com';
    const password = 'admin@gmail.com';
    
    // Check if user already exists
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log('User already exists in Firebase Auth:', userRecord.uid);
      
      // Ensure they exist in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email,
        role: 'admin',
        fullName: 'Platform Admin'
      }, { merge: true });
      
      console.log('Updated Firestore admin role');
      process.exit(0);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      
      // User not found, create them
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: 'Platform Admin'
      });
      
      console.log('Created Firebase Auth user:', userRecord.uid);
      
      await db.collection('users').doc(userRecord.uid).set({
        email,
        role: 'admin',
        fullName: 'Platform Admin',
        createdAt: new Date().toISOString()
      });
      
      console.log('Admin user successfully created in Firestore!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
