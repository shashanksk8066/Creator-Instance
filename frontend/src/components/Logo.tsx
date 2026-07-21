import React from 'react';

export const Logo = ({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center font-black uppercase tracking-tight leading-[0.85] max-md:[-webkit-text-stroke:0.5px_currentColor] ${sizeClasses[size]} ${className}`}>
      <span className="text-gray-900 tracking-tighter text-[0.75em]">Creator</span>
      <span className="text-blue-600">Instance</span>
    </div>
  );
};
