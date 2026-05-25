import React, { lazy, Suspense } from 'react';

export default function dynamic(importFunc, options = {}) {
  const LazyComponent = lazy(importFunc);

  return function DynamicComponent(props) {
    const fallback = options.loading ? options.loading() : null;
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
