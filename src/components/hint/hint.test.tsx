import { Hint } from '@app-components/hint';

import { renderWithStore, screen } from '../../../jest/render';

/**
 * The first render test in the repo, so it doubles as the pattern: await the
 * render, and query by what a person sees or a screen reader announces — never
 * by testID.
 */
describe('Hint', () => {
  test('shows the message it was given', async () => {
    await renderWithStore(<Hint message="Sending a code to this number" />);

    expect(screen.getByText('Sending a code to this number')).toBeTruthy();
  });

  test('announces the message, because it changes while the screen is open', async () => {
    await renderWithStore(<Hint message="Wrong password" />);

    expect(screen.getByText('Wrong password').props.accessibilityLiveRegion).toBe('polite');
  });
});
