'use client';

type OmnexLogoProps = {
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
};

export function OmnexLogo({ className = '', showIcon = true, iconOnly = false }: OmnexLogoProps) {
  if (iconOnly) {
    return (
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`} style={{ backgroundColor: 'var(--omnex-red)' }}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 22V12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M2 7L12 12L22 7" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--omnex-red)' }}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className="h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 22V12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 7L12 12L22 7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <span className="font-extrabold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <span style={{ color: 'var(--omnex-red)' }}>OMNEX</span>
        <span className="text-foreground dark:text-white"> STUDY</span>
      </span>
    </div>
  );
}