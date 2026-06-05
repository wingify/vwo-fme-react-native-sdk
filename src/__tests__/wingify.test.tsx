/**
 * Copyright 2024-2026 Wingify Software Pvt. Ltd.
 */

import { NativeModules } from 'react-native';
import { init, Wingify } from '../wingify';

jest.mock('react-native', () => ({
  NativeModules: {
    VwoFmeReactNativeSdk: {
      initializeVwo: jest.fn().mockResolvedValue('ok'),
      initializeWingify: jest.fn().mockResolvedValue('ok'),
      sendSdkInitTime: jest.fn().mockResolvedValue(undefined),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
  Platform: {
    select: jest.fn(),
    constants: { reactNativeVersion: { major: 0, minor: 76, patch: 5 } },
  },
}));

describe('Wingify public API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Wingify._instances.clear();
  });

  it('init forwards sdkBrand wingify and vwoMeta to native initialize', async () => {
    const client = await init({
      accountId: 99,
      sdkKey: 'sdk-key',
      vwoMeta: { source: 'wingify-test' },
    });

    expect(client).toBeInstanceOf(Wingify);
    expect(
      NativeModules.VwoFmeReactNativeSdk.initializeWingify
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        vwoMeta: expect.objectContaining({ source: 'wingify-test' }),
      })
    );
    expect(
      NativeModules.VwoFmeReactNativeSdk.initializeVwo
    ).not.toHaveBeenCalled();
  });
});
