/**
 * Every route in the app, by name.
 *
 * Nothing may pass a raw path string — components, deep links and notification
 * handlers all resolve through this map. That keeps a name arriving from a
 * server safe to look up, and makes renaming a route a one-line change.
 */
const Containers = {
  /** Where a cold start lands. */
  HomeScreen: '/',
} as const;

export type ContainerKey = keyof typeof Containers;
export type ContainerPath = (typeof Containers)[ContainerKey];

/** Safe lookup for names that arrive from a server or notification payload. */
export function resolveContainer(name: string): ContainerPath | undefined {
  return Containers[name as ContainerKey];
}

export default Containers;
