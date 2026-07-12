import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Ad {
  id: string;
  name: string;
  provider: string;
  placement: string;
  priority: number;
  desktop: boolean;
  mobile: boolean;
  enabled: boolean;
  code: string;
}

interface AdvertisementContextType {
  ads: Ad[];
  loading: boolean;
}

const AdvertisementContext = createContext<AdvertisementContextType>({ ads: [], loading: true });

export const useAds = () => useContext(AdvertisementContext);

export const AdvertisementProvider = ({ children }: { children: React.ReactNode }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/public/ads');
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (err) {
        console.error('Failed to fetch advertisements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <AdvertisementContext.Provider value={{ ads, loading }}>
      {children}
    </AdvertisementContext.Provider>
  );
};
