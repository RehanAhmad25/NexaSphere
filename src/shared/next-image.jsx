import React from 'react';

export default function Image({ src, alt, width, height, fill, style, className, ...props }) {
  const imageStyle = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover',
        ...style,
      }
    : {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        ...style,
      };

  return (
    <img
      src={src}
      alt={alt}
      style={imageStyle}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
