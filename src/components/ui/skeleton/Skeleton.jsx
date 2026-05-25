import React from 'react';
import './Skeleton.css';

/**
 * Base animated skeleton component.
 * @param {boolean} animate - Enable shimmer animation (default: true)
 * @param {boolean} rounded - Apply full border-radius for avatars/circles
 * @param {string|number} width - CSS width
 * @param {string|number} height - CSS height
 * @param {string} className - Additional CSS classes
 * @param {number} count - Render multiple skeletons in a fragment
 * @param {object} style - Additional inline styles
 */
export const Skeleton = ({
  animate = true,
  rounded = false,
  width,
  height,
  className = '',
  count = 1,
  style = {}
}) => {
  const elements = [];
  
  for (let i = 0; i < count; i++) {
    elements.push(
      <span
        key={i}
        className={`nx-skeleton ${animate ? 'nx-skeleton-animate' : ''} ${className}`}
        style={{
          width: width || '100%',
          height: height || '1em',
          borderRadius: rounded ? '50%' : undefined,
          display: 'inline-block',
          ...style
        }}
        aria-busy="true"
        aria-hidden="true"
        role="status"
      />
    );
  }

  return <>{elements}</>;
};

export const SkeletonText = ({ lines = 3, animate = true, lastLineWidth = '60%', gap = '8px', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          animate={animate}
          height="1em"
          width={i === lines - 1 ? lastLineWidth : '100%'}
          {...props}
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = 48, ...props }) => {
  return <Skeleton rounded width={size} height={size} {...props} />;
};
