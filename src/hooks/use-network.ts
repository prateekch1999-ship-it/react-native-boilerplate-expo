import { useNetworkState } from 'expo-network';

/**
 * Connectivity is device state, not app state, so it stays a hook rather than
 * living in the store — nothing dispatches it and nothing else derives from it.
 */
export function useNetwork(): { isConnected: boolean } {
  const network = useNetworkState();

  // ponytail: unknown reachability counts as online, so a flaky probe never locks the UI
  return { isConnected: network.isInternetReachable ?? true };
}
