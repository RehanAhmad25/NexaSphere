export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIPhoneIPad = /iphone|ipad|ipod/.test(userAgent);

  // Handle iPadOS 13+ which appears as MacIntel but supports touch
  const isMacWithTouch =
    userAgent.includes('mac') &&
    window.navigator.maxTouchPoints &&
    window.navigator.maxTouchPoints > 2;

  return isIPhoneIPad || isMacWithTouch;
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium')
  );
};
