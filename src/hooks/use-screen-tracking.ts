import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import Analytics from '@app-helpers/analytics';

/**
 * Reports a screen view on every navigation. Mounted once in the root layout.
 *
 * expo-router has no screen-change callback to subscribe to, and PostHog's
 * autocapture only understands React Navigation's own container, so the route
 * path is what we watch.
 *
 * ponytail: the path only, no search params — params would re-fire the effect
 * on every filter change and bury the real navigations. Pass them explicitly
 * via `Analytics.screen()` from a screen that needs them.
 */
export function useScreenTracking(): void {
  const pathname = usePathname();

  useEffect(() => {
    Analytics.screen(pathname);
  }, [pathname]);
}
