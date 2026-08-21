import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'light', size = 'md' }) => {
  const isDark = variant === 'dark';
  
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  }[size];

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl'
  }[size];

  const badgeSizeClasses = {
    sm: 'text-[8px] px-1.5 py-0.2',
    md: 'text-[9px] px-1.5 py-0.5',
    lg: 'text-[10px] px-2 py-0.5'
  }[size];

  const subtitleSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern Google 4-Color Academic / Community Emblem */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizeClasses} shrink-0 drop-shadow-xs transition-transform duration-200 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Neo-Brutalist Rounded Container */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="24"
          fill={isDark ? '#0F172A' : '#FFFFFF'}
          stroke="#1E293B"
          strokeWidth="6"
        />

        {/* 4 Google Colors - 4 Interlocking Community Petals / Star Arms */}
        {/* Top Petal: Google Blue (#4285F4) */}
        <path
          d="M50 15 C59 15 66 22 66 31 C66 42 50 50 50 50 C50 50 34 42 34 31 C34 22 41 15 50 15 Z"
          fill="#4285F4"
        />

        {/* Right Petal: Google Red (#EA4335) */}
        <path
          d="M85 50 C85 59 78 66 69 66 C58 66 50 50 50 50 C50 50 58 34 69 34 C78 34 85 41 85 50 Z"
          fill="#EA4335"
        />

        {/* Bottom Petal: Google Yellow (#FBBC04) */}
        <path
          d="M50 85 C41 85 34 78 34 69 C34 58 50 50 50 50 C50 50 66 58 66 69 C66 78 59 85 50 85 Z"
          fill="#FBBC04"
        />

        {/* Left Petal: Google Green (#34A853) */}
        <path
          d="M15 50 C15 41 22 34 31 34 C42 34 50 50 50 50 C50 50 42 66 31 66 C22 66 15 59 15 50 Z"
          fill="#34A853"
        />

        {/* Center Sparkle Node - Pure White with subtle dark contour */}
        <path
          d="M50 35 Q50 50 65 50 Q50 50 50 65 Q50 50 35 50 Q50 50 50 35 Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Center Core Dot */}
        <circle cx="50" cy="50" r="3.5" fill="#4285F4" />
      </svg>

      {/* Brand Text Lockup */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${titleSizeClasses} leading-none ${isDark ? 'text-white' : 'text-[#1e293b]'}`}>
            Campus<span className="text-[#4285F4]">Hub</span>
          </span>
          
          {/* Year Badge in Google Yellow with neo-brutalist border */}
          <span className={`bg-[#FBBC04] text-[#1e293b] ${badgeSizeClasses} rounded-md font-black tracking-wider uppercase border-2 border-[#1e293b] shadow-[1.5px_1.5px_0px_#1e293b]`}>
            2026
          </span>
        </div>
        
        {/* Subtitle with 4 Google colored micro dots */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`${subtitleSizeClasses} tracking-tight font-bold ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Comunidade Estudantil Independente
          </span>
          <div className="hidden sm:flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
