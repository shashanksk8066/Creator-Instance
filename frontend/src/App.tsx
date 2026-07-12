import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlatformApp } from './PlatformApp';
import { PublicApp } from './PublicApp';

// Simple logic to detect if we're on a tenant subdomain
const isSubdomain = () => {
  const host = window.location.hostname;
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'localhost';
  
  if (host === baseDomain || host === `www.${baseDomain}`) {
    return false;
  }
  
  if (host.endsWith(`.${baseDomain}`)) {
    return true;
  }
  
  // Fallback heuristic if somehow environment isn't set perfectly
  const parts = host.split('.');
  if (host.includes('localhost')) {
     return parts.length > 1 && parts[0] !== 'localhost';
  }
  return parts.length > 2 && parts[0] !== 'www';
};

function App() {
  const isTenantSite = isSubdomain();

  return (
    <AuthProvider>
      <BrowserRouter>
        {isTenantSite ? <PublicApp /> : <PlatformApp />}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
