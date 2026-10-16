import { formatCountdown } from '@app-helpers/countdown';

describe('formatCountdown', () => {
  test('pads the seconds, so 0:24 never renders as 0:2', () => {
    expect(formatCountdown(24)).toBe('0:24');
    expect(formatCountdown(4)).toBe('0:04');
  });

  test('rolls into minutes', () => {
    expect(formatCountdown(60)).toBe('1:00');
    expect(formatCountdown(91)).toBe('1:31');
  });

  test('clamps at zero, so a late interval tick cannot show a negative time', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(-5)).toBe('0:00');
  });
});
