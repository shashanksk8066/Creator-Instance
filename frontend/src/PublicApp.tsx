import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdvertisementProvider } from './contexts/AdvertisementContext';
import { HeadStartAds, HeadEndAds, BodyEndAds } from './components/ads/AdPlacements';

import { Home } from './pages/public/Home';
import { BlogList } from './pages/public/BlogList';
import { BlogSingle } from './pages/public/BlogSingle';
import { About } from './pages/public/About';

export const PublicApp = () => {
  return (
    <AdvertisementProvider>
      <HeadStartAds />
      <HeadEndAds />
      <BodyEndAds />
      
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:slug" element={<BlogSingle />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AdvertisementProvider>
  );
};
