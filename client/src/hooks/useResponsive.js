import { useEffect, useState } from 'react';

/**
 * useResponsive Hook
 * Provides responsive breakpoint information
 *
 * Usage:
 * const { isMobile, isTablet, isDesktop, width, breakpoint } = useResponsive();
 */
export function useResponsive() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Debounced resize handler
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Breakpoints: xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536
  const isMobile = size.width < 640;
  const isSmall = size.width < 768;
  const isTablet = size.width >= 640 && size.width < 1024;
  const isDesktop = size.width >= 1024;
  const isLargeDesktop = size.width >= 1280;

  let breakpoint = 'xs';
  if (size.width >= 1536) breakpoint = '2xl';
  else if (size.width >= 1280) breakpoint = 'xl';
  else if (size.width >= 1024) breakpoint = 'lg';
  else if (size.width >= 768) breakpoint = 'md';
  else if (size.width >= 640) breakpoint = 'sm';

  // Handle edge cases
  const isBelowMinimum = size.width < 320;
  const isAboveMaximum = size.width > 1920;

  return {
    width: size.width,
    height: size.height,
    isMobile,
    isSmall,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
    isBelowMinimum,
    isAboveMaximum,
    // Utility functions
    matches: (min, max) => size.width >= min && size.width < max,
    isWithinRange: (min, max) => size.width >= min && size.width <= max,
  };
}

/**
 * useScreenSize Hook
 * Simplified version returning just the breakpoint name
 *
 * Usage:
 * const breakpoint = useScreenSize(); // returns 'mobile', 'tablet', 'desktop'
 */
export function useScreenSize() {
  const { breakpoint } = useResponsive();
  return breakpoint;
}

/**
 * useIsMobile Hook
 * Simple boolean for mobile detection
 *
 * Usage:
 * const isMobile = useIsMobile();
 */
export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * useMediaQuery Hook
 * Generic media query hook
 *
 * Usage:
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * useTierResponsiveness Hook
 * Adjusts UI based on both tier and screen size
 *
 * Usage:
 * const { columnCount, cardSize, showComparison } = useTierResponsiveness();
 */
export function useTierResponsiveness() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Determine columns for pricing grid based on screen size
  let columnCount = 1;
  if (isTablet) columnCount = 2;
  if (isDesktop) columnCount = 4;

  // Card sizing
  let cardSize = 'sm'; // mobile: small
  if (isTablet) cardSize = 'md'; // tablet: medium
  if (isDesktop) cardSize = 'lg'; // desktop: large

  // Whether to show detailed comparison table
  const showComparison = !isMobile;

  // Feature list truncation for mobile
  const maxFeaturesShown = isMobile ? 4 : null;

  // Pricing table layout
  const pricingTableLayout = isMobile ? 'vertical' : 'horizontal';

  return {
    columnCount,
    cardSize,
    showComparison,
    maxFeaturesShown,
    pricingTableLayout,
    isMobile,
    isTablet,
    isDesktop,
  };
}

export default useResponsive;
