import { fireEvent, render, screen } from '@testing-library/react-native';

import { CrashScreen } from '@app-components/crash-screen';
import Crash from '@app-helpers/crash';

const mockGetLanguage = jest.fn<'en' | 'hi' | null, []>(() => 'en');

jest.mock('@app-services/storage.service', () => ({
  __esModule: true,
  default: { check: { getLanguage: () => mockGetLanguage() } },
}));
jest.mock('@app-helpers/crash', () => ({
  __esModule: true,
  default: { recordError: jest.fn() },
}));

const error = new Error('render blew up');
const noop = async () => {};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetLanguage.mockReturnValue('en');
});

/**
 * Rendered with plain `render`, not `renderWithStore`, on purpose: the whole
 * point of this component is that it works with no provider above it, because
 * expo-router renders it in place of the layout that holds them. If it ever
 * needs one, this test fails and that is the warning.
 */
describe('CrashScreen', () => {
  test('offers a way out rather than a blank screen', async () => {
    const retry = jest.fn(noop);
    await render(<CrashScreen error={error} retry={retry} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  test('reports the error, which nothing else would have', async () => {
    await render(<CrashScreen error={error} retry={jest.fn(noop)} />);

    expect(Crash.recordError).toHaveBeenCalledWith(error, { boundary: 'root' });
  });

  test('speaks the language that was chosen before the crash', async () => {
    mockGetLanguage.mockReturnValue('hi');

    await render(<CrashScreen error={error} retry={jest.fn(noop)} />);

    expect(screen.getByText('कुछ गड़बड़ हो गई')).toBeTruthy();
  });

  test('falls back to English when no language was ever chosen', async () => {
    mockGetLanguage.mockReturnValue(null);

    await render(<CrashScreen error={error} retry={jest.fn(noop)} />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
