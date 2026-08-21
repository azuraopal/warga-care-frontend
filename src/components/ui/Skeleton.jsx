import React from 'react';

export function Skeleton({ width, height, borderRadius, style, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || '8px',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="45%" height="1.3rem" borderRadius="8px" />
            <Skeleton width="20%" height="1rem" borderRadius="6px" />
          </div>
          <Skeleton width="100%" height="2.2rem" borderRadius="10px" />
          <Skeleton width="85%" height="0.95rem" borderRadius="6px" />
          <Skeleton width="60%" height="0.95rem" borderRadius="6px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
            border: '1px solid #f1f5f9',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Skeleton width="100%" height="160px" borderRadius="16px" />
          <Skeleton width="70%" height="1.2rem" borderRadius="6px" />
          <Skeleton width="50%" height="0.9rem" borderRadius="6px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ width: '60%' }}>
            <Skeleton width="80%" height="0.85rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="40%" height="1.8rem" borderRadius="6px" />
          </div>
          <Skeleton width="44px" height="44px" borderRadius="14px" />
        </div>
      ))}
    </div>
  );
}
