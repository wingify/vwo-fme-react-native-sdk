/**
 * Copyright 2024-2026 Wingify Software Pvt. Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NativeModules } from 'react-native';
import { VWO } from '../index';
import type { VWOUserContext } from '../types';

jest.mock('react-native', () => {
  const mockAddListener = jest.fn();
  const mockRemove = jest.fn();

  return {
    NativeModules: {
      VwoFmeReactNativeSdk: {
        initialize: jest.fn(),
        getFlag: jest.fn(),
        getFlags: jest.fn(),
        trackEvent: jest.fn(),
        setAttribute: jest.fn(),
        setSessionData: jest.fn(),
      },
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: mockAddListener.mockReturnValue({ remove: mockRemove }),
    })),
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
      constants: {
        reactNativeVersion: {
          major: 0,
          minor: 76,
          patch: 5,
        },
      },
    },
  };
});

describe('getFlags functionality', () => {
  let mockNativeModule: any;
  let vwoInstance: VWO;
  let mockUserContext: VWOUserContext;

  const mockPayload = {
    flags: {
      checkout: {
        isEnabled: true,
        variables: [{ key: 'color', value: 'blue', type: 'string', id: 1 }],
      },
      pricing: {
        isEnabled: false,
        variables: [],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    vwoInstance = new VWO();
    vwoInstance.accountId = 123;
    vwoInstance.sdkKey = 'sdk-key';
    mockUserContext = { id: 'test-user-123' };
  });

  it('evaluates the requested flags and looks them up by feature key', async () => {
    mockNativeModule.getFlags.mockResolvedValue(mockPayload);

    const result = await vwoInstance.getFlags(
      ['checkout', 'pricing'],
      mockUserContext
    );

    expect(mockNativeModule.getFlags).toHaveBeenCalledWith(
      ['checkout', 'pricing'],
      123,
      'sdk-key',
      mockUserContext
    );
    expect(result.size()).toBe(2);
    expect(result.keys()).toEqual(['checkout', 'pricing']);
    expect(result.get('checkout').isEnabled()).toBe(true);
    expect(result.get('checkout').getVariable('color', 'red')).toBe('blue');
    expect(result.get('pricing').isEnabled()).toBe(false);
    expect(result.get('pricing').getVariables()).toEqual([]);
    expect(result.get('missing').isEnabled()).toBe(false);
    expect(result.get('missing').getVariable('color', 'red')).toBe('red');
  });

  it('passes null when every flag should be evaluated', async () => {
    mockNativeModule.getFlags.mockResolvedValue({ flags: {} });

    const result = await vwoInstance.getFlags(null, mockUserContext);

    expect(mockNativeModule.getFlags).toHaveBeenCalledWith(
      null,
      123,
      'sdk-key',
      mockUserContext
    );
    expect(result.size()).toBe(0);
    expect(result.keys()).toEqual([]);
  });

  it('rejects when the native getFlags call fails', async () => {
    const error = new Error('native failure');
    mockNativeModule.getFlags.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      vwoInstance.getFlags(['checkout'], mockUserContext)
    ).rejects.toThrow('native failure');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to get feature flags:',
      error
    );

    consoleSpy.mockRestore();
  });
});
