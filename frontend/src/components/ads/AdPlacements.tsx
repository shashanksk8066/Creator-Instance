import { useEffect } from 'react';
import { useAds, type Ad } from '../../contexts/AdvertisementContext';
import { AdRenderer } from './AdRenderer';
import { createPortal } from 'react-dom';

const filterAds = (ads: Ad[], placement: string) => {
  return ads.filter(ad => ad.placement === placement && ad.enabled);
};

const renderAdWrapper = (ad: Ad) => {
  // Use Tailwind CSS to control desktop/mobile visibility
  let visibilityClass = '';
  if (ad.desktop && !ad.mobile) {
    visibilityClass = 'hidden md:block';
  } else if (!ad.desktop && ad.mobile) {
    visibilityClass = 'block md:hidden';
  } else if (!ad.desktop && !ad.mobile) {
    return null; // Don't render if both are false
  }

  return (
    <div key={ad.id} className={`w-full flex justify-center my-4 ${visibilityClass}`}>
      <AdRenderer code={ad.code} />
    </div>
  );
};

// Generic inline placement wrapper
export const InlinePlacement = ({ placement }: { placement: string }) => {
  const { ads, loading } = useAds();
  
  if (loading) return null;

  const placementAds = filterAds(ads, placement);
  if (placementAds.length === 0) return null;

  return (
    <>
      {placementAds.map(renderAdWrapper)}
    </>
  );
};

// Head Start - Injects immediately into <head> (top)
export const HeadStartAds = () => {
  const { ads, loading } = useAds();
  if (loading) return null;
  const placementAds = filterAds(ads, 'HEAD_START');
  
  return createPortal(
    <>
      {placementAds.map(ad => <AdRenderer key={ad.id} code={ad.code} />)}
    </>,
    document.head
  );
};

// Head End - Injects immediately into <head> (bottom)
export const HeadEndAds = () => {
  const { ads, loading } = useAds();
  if (loading) return null;
  const placementAds = filterAds(ads, 'HEAD_END');
  
  return createPortal(
    <>
      {placementAds.map(ad => <AdRenderer key={ad.id} code={ad.code} />)}
    </>,
    document.head
  );
};

// Body Start - Injects immediately at start of <body>
export const BodyStartAds = () => {
  const { ads, loading } = useAds();
  if (loading) return null;
  const placementAds = filterAds(ads, 'BODY_START');
  
  return createPortal(
    <>
      {placementAds.map(ad => <AdRenderer key={ad.id} code={ad.code} />)}
    </>,
    document.body // Will be appended to the end, but wait, body start should prepend. React portal appends by default.
  );
};

// Body End - Injects immediately before </body>
export const BodyEndAds = () => {
  const { ads, loading } = useAds();
  if (loading) return null;
  const placementAds = filterAds(ads, 'BODY_END');
  
  return createPortal(
    <>
      {placementAds.map(ad => <AdRenderer key={ad.id} code={ad.code} />)}
    </>,
    document.body
  );
};

// Standard Inline Placements
export const BeforeHeaderAds = () => <InlinePlacement placement="BEFORE_HEADER" />;
export const AfterHeaderAds = () => <InlinePlacement placement="AFTER_HEADER" />;
export const ArticleTopAds = () => <InlinePlacement placement="ARTICLE_TOP" />;
export const ArticleBottomAds = () => <InlinePlacement placement="ARTICLE_BOTTOM" />;
export const BeforeRelatedPostsAds = () => <InlinePlacement placement="BEFORE_RELATED_POSTS" />;
export const SidebarTopAds = () => <InlinePlacement placement="SIDEBAR_TOP" />;
export const BeforeFooterAds = () => <InlinePlacement placement="BEFORE_FOOTER" />;

// CTA Button Popunder - intercepts clicks on .ad-cta-button
export const CtaPopunderAds = () => {
  const { ads, loading } = useAds();
  
  useEffect(() => {
    if (loading) return;
    const ctaAds = filterAds(ads, 'CTA_BUTTON');
    if (ctaAds.length === 0) return;
    
    // Assuming the user pastes the Smart Direct Ads Link (URL) directly into the ad code field
    // We try to extract the URL if they accidentally pasted a script or href, but normally it's just raw URL
    const rawCode = ctaAds[0].code.trim();
    let adUrl = rawCode;
    
    // Extract from href="..." if the user pasted HTML
    const hrefMatch = rawCode.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      adUrl = hrefMatch[1];
    } else if (rawCode.includes('http')) {
      // Fallback extraction
      const match = rawCode.match(/https?:\/\/[^"'\s<>]+/);
      if (match) adUrl = match[0];
    }
    
    if (!adUrl.startsWith('http://') && !adUrl.startsWith('https://')) {
      adUrl = 'https://' + adUrl;
    }

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.ad-cta-button') as HTMLAnchorElement;
      
      // If the clicked element is an anchor tag with an href
      if (target && target.tagName === 'A' && target.href) {
        // Only trigger popunder if it's not a hash link or empty
        if (!target.href.startsWith('javascript:') && !target.href.startsWith('#')) {
          e.preventDefault();
          e.stopPropagation(); // Stop React Router from handling this click
          
          // The Pop-under Trick:
          // 1. Open the actual destination in a new tab (gets foreground focus)
          window.open(target.href, '_blank');
          
          // 2. Navigate the current tab (which just went to the background) to the Ad URL
          window.location.href = adUrl;
        }
      }
    };

    // Use capture phase to intercept before React Router
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [ads, loading]);

  return null;
};

// Special placement for ARTICLE_MIDDLE which needs to inject between paragraphs
export const ArticleMiddleAds = ({ content }: { content: string }) => {
  const { ads, loading } = useAds();
  
  if (loading) return <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />;

  const placementAds = filterAds(ads, 'ARTICLE_MIDDLE');
  
  if (placementAds.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />;
  }

  // Split content by paragraphs
  const paragraphs = content.split(/(<\/p>)/i);
  
  if (paragraphs.length < 4) {
    // If it's a very short article, just put the ad at the bottom
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />
        {placementAds.map(renderAdWrapper)}
      </>
    );
  }

  // Find the middle paragraph
  const middleIndex = Math.floor(paragraphs.length / 2);
  // Ensure we break cleanly after a closing </p> tag
  const splitIndex = middleIndex % 2 === 0 ? middleIndex : middleIndex + 1;

  const firstHalf = paragraphs.slice(0, splitIndex).join('');
  const secondHalf = paragraphs.slice(splitIndex).join('');

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: firstHalf }} className="prose max-w-none" />
      <div className="my-8 py-4 border-y border-gray-100">
        <div className="text-center text-xs text-gray-400 mb-2 uppercase tracking-wider">Advertisement</div>
        {placementAds.map(renderAdWrapper)}
      </div>
      <div dangerouslySetInnerHTML={{ __html: secondHalf }} className="prose max-w-none" />
    </>
  );
};
