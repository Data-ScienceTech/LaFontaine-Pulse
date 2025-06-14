/**
 * Custom hook to track user scroll behavior and section visibility
 * Helps understand which parts of the app users engage with most
 */

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface UseScrollTrackingOptions {
  enabled: boolean;
  sectionName: string;
  threshold?: number; // Percentage of section that must be visible
}

export const useScrollTracking = ({ 
  enabled, 
  sectionName, 
  threshold = 0.5 
}: UseScrollTrackingOptions) => {
  const elementRef = useRef<HTMLElement>(null);
  const hasBeenViewedRef = useRef(false);
  const viewStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            // Section became visible
            if (!hasBeenViewedRef.current) {
              analytics.trackEvent('section_view', { 
                section: sectionName,
                first_view: true 
              });
              hasBeenViewedRef.current = true;
            }
            
            viewStartTimeRef.current = Date.now();
            
            // Track extended viewing (after 3 seconds)
            timeoutId = setTimeout(() => {
              analytics.trackEvent('section_engagement', { 
                section: sectionName,
                engagement_type: 'extended_view',
                min_duration: 3
              });
            }, 3000);
            
          } else if (viewStartTimeRef.current) {
            // Section became hidden - calculate view duration
            const viewDuration = Date.now() - viewStartTimeRef.current;
            
            if (viewDuration > 1000) { // Only track if viewed for more than 1 second
              analytics.trackEvent('section_view_duration', {
                section: sectionName,
                duration_ms: viewDuration,
                duration_seconds: Math.floor(viewDuration / 1000)
              });
            }
            
            viewStartTimeRef.current = null;
            clearTimeout(timeoutId);
          }
        });
      },
      { threshold: [0, threshold, 1] }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [enabled, sectionName, threshold]);

  return elementRef;
};

/**
 * Hook to track clicks on specific elements
 */
export const useClickTracking = (
  enabled: boolean, 
  elementName: string, 
  additionalData?: Record<string, any>
) => {
  const handleClick = (event: React.MouseEvent) => {
    if (enabled) {
      analytics.trackFeatureUsage(elementName, 'click', {
        ...additionalData,
        timestamp: new Date().toISOString(),
        position: {
          x: event.clientX,
          y: event.clientY
        }
      });
    }
  };

  return handleClick;
};
