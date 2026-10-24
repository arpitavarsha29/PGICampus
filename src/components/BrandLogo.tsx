import React, { useState } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 42,
  className = '',
  showText = true,
  subText = 'PRASAD GROUP OF INSTITUTIONS',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`brand-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        className="brand-logo-wrapper"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '10px',
          background: imgError ? 'linear-gradient(140deg, #059669, #0F766E)' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: imgError ? '0' : '3px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          flexShrink: 0,
        }}
      >
        {!imgError ? (
          <img
            src="/images/pgi-logo.png"
            alt="Prasad Group of Institutions Logo"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: `${Math.round(size * 0.4)}px`,
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: '-0.5px',
            }}
          >
            PGI
          </span>
        )}
      </div>

      {showText && (
        <div>
          <strong
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              display: 'block',
              letterSpacing: '-0.5px',
              color: '#FFFFFF',
              lineHeight: 1.2,
            }}
          >
            SmartCampus
          </strong>
          {subText && (
            <small
              style={{
                fontSize: '8px',
                letterSpacing: '0.75px',
                color: '#DCE8DF',
                display: 'block',
                marginTop: '3px',
                fontWeight: 700,
              }}
            >
              {subText}
            </small>
          )}
        </div>
      )}
    </div>
  );
};
