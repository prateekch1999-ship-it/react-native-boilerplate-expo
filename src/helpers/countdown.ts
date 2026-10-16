/**
 * Seconds as `m:ss`, the form the resend timer uses — `0:24`.
 *
 * Clamped at zero so a late interval tick can never render a negative time.
 */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}
