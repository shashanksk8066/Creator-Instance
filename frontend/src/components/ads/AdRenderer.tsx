import { useEffect, useRef } from 'react';

export const AdRenderer = ({ code, className = '' }: { code: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Clear previous contents
    containerRef.current.innerHTML = '';

    // Create a temporary div to parse the raw HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code.trim();

    // Move child nodes from tempDiv to our actual container
    const nodes = Array.from(tempDiv.childNodes);
    
    nodes.forEach(node => {
      if (node.nodeName.toLowerCase() === 'script') {
        // Scripts injected via innerHTML are NOT executed by the browser for security reasons.
        // To force execution (e.g. for Adsterra/AdSense scripts), we must manually recreate the script element.
        const scriptElement = document.createElement('script');
        const originalScript = node as HTMLScriptElement;

        // Copy all attributes (src, async, type, etc.)
        Array.from(originalScript.attributes).forEach(attr => {
          scriptElement.setAttribute(attr.name, attr.value);
        });

        // Copy inline script content if any
        if (originalScript.innerHTML) {
          scriptElement.innerHTML = originalScript.innerHTML;
        }

        containerRef.current?.appendChild(scriptElement);
      } else {
        // Standard HTML nodes (div, img, iframe, text, etc.) can be appended directly
        containerRef.current?.appendChild(node.cloneNode(true));
      }
    });

  }, [code]);

  return <div ref={containerRef} className={`ad-container ${className}`} />;
};
