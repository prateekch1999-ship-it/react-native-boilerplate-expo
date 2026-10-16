import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { store } from '@app-store/index';

/**
 * `render` for anything that reads the store — which is most components, since
 * `ThemedText` picks its type scale from the chosen language.
 *
 * The real store rather than a hand-written state: its reducers are as much the
 * thing under test as the component is.
 *
 * Async because `render` is: from v14 the library awaits React 19's concurrent
 * rendering, so every call site needs `await`, and so does `fireEvent`.
 */
export function renderWithStore(ui: ReactElement) {
  return render(<Provider store={store}>{ui}</Provider>);
}

export * from '@testing-library/react-native';
