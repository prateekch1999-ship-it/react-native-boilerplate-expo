import * as Notifications from 'expo-notifications';

import Crash from '@app-helpers/crash';
import { askNotificationPermission } from '@app-helpers/notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));
jest.mock('@app-helpers/crash', () => ({ __esModule: true, default: { recordError: jest.fn() } }));

const mocked = jest.mocked(Notifications);

describe('askNotificationPermission', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not ask again when notifications are already allowed', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true } as never);

    await expect(askNotificationPermission('Orders')).resolves.toBe(true);
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('shows the pop-up and passes on the answer when it can still ask', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    mocked.requestPermissionsAsync.mockResolvedValue({ granted: false } as never);

    await expect(askNotificationPermission('Orders')).resolves.toBe(false);
    expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('stays quiet after a refusal for good', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);

    await expect(askNotificationPermission('Orders')).resolves.toBe(false);
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('reports a failure instead of throwing, so sign-up carries on', async () => {
    mocked.getPermissionsAsync.mockRejectedValue(new Error('native module missing'));

    await expect(askNotificationPermission('Orders')).resolves.toBe(false);
    expect(Crash.recordError).toHaveBeenCalledTimes(1);
  });
});
