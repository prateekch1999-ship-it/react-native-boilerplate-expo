import { router } from 'expo-router';

import Containers, { resolveContainer, type ContainerPath } from '@app-navigation/containers';

type Params = Record<string, string | number>;

const toHref = (path: ContainerPath, params?: Params) =>
  params ? ({ pathname: path, params } as const) : path;

/**
 * Imperative navigation for code that lives outside the component tree —
 * services, deep-link handlers, notification handlers. Inside components use
 * `useRouter()` or `<Link />` instead.
 */
const NavigationHelper = {
  navigate(path: ContainerPath, params?: Params) {
    router.push(toHref(path, params));
  },

  replace(path: ContainerPath, params?: Params) {
    router.replace(toHref(path, params));
  },

  goBack() {
    if (router.canGoBack()) router.back();
  },

  /** Drops the current stack so Back lands on Home rather than the old screen. */
  resetTo(path: ContainerPath, params?: Params) {
    if (router.canDismiss()) router.dismissAll();
    router.replace(toHref(path, params));
  },

  /**
   * Navigate by route *name* (e.g. from a push payload). Unknown names fall
   * back to Home rather than throwing at the user.
   */
  navigateByName(name: string, params?: Params) {
    const path = resolveContainer(name);
    if (!path) {
      console.warn(`[navigation] unknown route name "${name}", falling back to Home`);
      NavigationHelper.navigate(Containers.HomeScreen);
      return;
    }
    NavigationHelper.navigate(path, params);
  },
};

export default NavigationHelper;
