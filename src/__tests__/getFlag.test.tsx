/**
 * Copyright 2024-2025 Wingify Software Pvt. Ltd.
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

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { VWO } from '../index';
import type { VWOUserContext, GetFlagResult } from '../types';

// Mock React Native modules
jest.mock('react-native', () => {
  const mockAddListener = jest.fn();
  const mockRemove = jest.fn();
  
  return {
    NativeModules: {
      VwoFmeReactNativeSdk: {
        initialize: jest.fn(),
        getFlag: jest.fn(),
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

describe('GetFlag Functionality Tests', () => {
  let mockNativeModule: any;
  let vwoInstance: VWO;
  let mockUserContext: VWOUserContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    vwoInstance = new VWO();
    mockUserContext = { id: 'test-user-123' };
  });

  describe('getFlag with enabled flags', () => {
    it('should return enabled flag with string variables', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'color', value: 'blue', type: 'string', id: 1 },
          { key: 'size', value: 'large', type: 'string', id: 2 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('color', 'default')).toBe('blue');
      expect(result.getVariable('size', 'default')).toBe('large');
      expect(result.getVariables()).toEqual(mockFlagData.variables);
    });

    it('should return enabled flag with number variables', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'count', value: 42, type: 'number', id: 1 },
          { key: 'price', value: 99.99, type: 'number', id: 2 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('count', 0)).toBe(42);
      expect(result.getVariable('price', 0)).toBe(99.99);
    });

    it('should return enabled flag with boolean variables', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'enabled', value: true, type: 'boolean', id: 1 },
          { key: 'visible', value: false, type: 'boolean', id: 2 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('enabled', false)).toBe(true);
      expect(result.getVariable('visible', true)).toBe(false);
    });

    it('should return enabled flag with object variables', async () => {
      const mockObject = { nested: 'value', count: 5 };
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'config', value: mockObject, type: 'object', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('config', {})).toEqual(mockObject);
    });

    it('should return enabled flag with array variables', async () => {
      const mockArray = ['item1', 'item2', 'item3'];
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'items', value: mockArray, type: 'array', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('items', [])).toEqual(mockArray);
    });
  });

  describe('getFlag with disabled flags', () => {
    it('should return disabled flag with empty variables', async () => {
      const mockFlagData = {
        isEnabled: false,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(false);
      expect(result.getVariables()).toEqual([]);
      expect(result.getVariable('any-key', 'default')).toBe('default');
    });

    it('should return disabled flag with variables (edge case)', async () => {
      const mockFlagData = {
        isEnabled: false,
        variables: [
          { key: 'color', value: 'red', type: 'string', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.isEnabled()).toBe(false);
      expect(result.getVariable('color', 'default')).toBe('red');
    });
  });

  describe('getVariable method behavior', () => {
    it('should return default value for non-existent variables', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'existing', value: 'value', type: 'string', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariable('non-existent', 'default')).toBe('default');
      expect(result.getVariable('another-missing', 42)).toBe(42);
      expect(result.getVariable('missing-boolean', true)).toBe(true);
      expect(result.getVariable('missing-object', {})).toEqual({});
    });

    it('should return default value for undefined variable values', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'undefined-value', value: undefined, type: 'string', id: 1 },
          { key: 'null-value', value: null, type: 'string', id: 2 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariable('undefined-value', 'default')).toBe('default');
      expect(result.getVariable('null-value', 'default')).toBe(null);
    });

    it('should handle case-sensitive variable keys', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'Color', value: 'blue', type: 'string', id: 1 },
          { key: 'color', value: 'red', type: 'string', id: 2 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariable('Color', 'default')).toBe('blue');
      expect(result.getVariable('color', 'default')).toBe('red');
    });

    it('should handle empty string keys', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: '', value: 'empty-key-value', type: 'string', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariable('', 'default')).toBe('empty-key-value');
    });

    it('should handle special characters in variable keys', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'key-with-dashes', value: 'dash-value', type: 'string', id: 1 },
          { key: 'key_with_underscores', value: 'underscore-value', type: 'string', id: 2 },
          { key: 'key.with.dots', value: 'dot-value', type: 'string', id: 3 },
          { key: 'key with spaces', value: 'space-value', type: 'string', id: 4 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariable('key-with-dashes', 'default')).toBe('dash-value');
      expect(result.getVariable('key_with_underscores', 'default')).toBe('underscore-value');
      expect(result.getVariable('key.with.dots', 'default')).toBe('dot-value');
      expect(result.getVariable('key with spaces', 'default')).toBe('space-value');
    });
  });

  describe('getVariables method behavior', () => {
    it('should return all variables as array', async () => {
      const mockVariables = [
        { key: 'var1', value: 'value1', type: 'string', id: 1 },
        { key: 'var2', value: 42, type: 'number', id: 2 },
        { key: 'var3', value: true, type: 'boolean', id: 3 },
      ];

      const mockFlagData = {
        isEnabled: true,
        variables: mockVariables,
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariables()).toEqual(mockVariables);
      expect(result.getVariables()).toHaveLength(3);
    });

    it('should return empty array when no variables', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariables()).toEqual([]);
      expect(result.getVariables()).toHaveLength(0);
    });

    it('should return variables with all properties intact', async () => {
      const mockVariables = [
        { key: 'test', value: 'value', type: 'string', id: 123 },
      ];

      const mockFlagData = {
        isEnabled: true,
        variables: mockVariables,
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);
      const variables = result.getVariables();

      expect(variables[0]).toHaveProperty('key', 'test');
      expect(variables[0]).toHaveProperty('value', 'value');
      expect(variables[0]).toHaveProperty('type', 'string');
      expect(variables[0]).toHaveProperty('id', 123);
    });
  });

  describe('User context variations', () => {
    it('should work with user context containing custom variables', async () => {
      const contextWithCustomVars: VWOUserContext = {
        id: 'user123',
        customVariables: {
          plan: 'premium',
          age: 25,
          country: 'US',
        },
      };

      const mockFlagData = {
        isEnabled: true,
        variables: [
          { key: 'feature', value: 'enabled', type: 'string', id: 1 },
        ],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', contextWithCustomVars);

      expect(mockNativeModule.getFlag).toHaveBeenCalledWith('test-feature', contextWithCustomVars);
      expect(result.isEnabled()).toBe(true);
    });

    it('should work with empty user context', async () => {
      const emptyContext: VWOUserContext = {};

      const mockFlagData = {
        isEnabled: false,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', emptyContext);

      expect(mockNativeModule.getFlag).toHaveBeenCalledWith('test-feature', emptyContext);
      expect(result.isEnabled()).toBe(false);
    });

    it('should work with user context containing only ID', async () => {
      const contextWithIdOnly: VWOUserContext = {
        id: 'user456',
      };

      const mockFlagData = {
        isEnabled: true,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', contextWithIdOnly);

      expect(mockNativeModule.getFlag).toHaveBeenCalledWith('test-feature', contextWithIdOnly);
      expect(result.isEnabled()).toBe(true);
    });
  });

  describe('Feature key variations', () => {
    it('should work with different feature key formats', async () => {
      const featureKeys = [
        'simple-feature',
        'feature_with_underscores',
        'feature.with.dots',
        'feature with spaces',
        'FEATURE_IN_UPPERCASE',
        'feature123',
        '123feature',
        'feature-with-123-numbers',
      ];

      const mockFlagData = {
        isEnabled: true,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      for (const featureKey of featureKeys) {
        await vwoInstance.getFlag(featureKey, mockUserContext);
        expect(mockNativeModule.getFlag).toHaveBeenCalledWith(featureKey, mockUserContext);
      }
    });

    it('should work with empty feature key', async () => {
      const mockFlagData = {
        isEnabled: false,
        variables: [],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('', mockUserContext);

      expect(mockNativeModule.getFlag).toHaveBeenCalledWith('', mockUserContext);
      expect(result.isEnabled()).toBe(false);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle native module errors gracefully', async () => {
      const error = new Error('Native module error');
      mockNativeModule.getFlag.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(vwoInstance.getFlag('test-feature', mockUserContext)).rejects.toThrow('Native module error');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get feature flag:', error);

      consoleSpy.mockRestore();
    });

    it('should handle malformed flag data', async () => {
      const malformedData = {
        isEnabled: 'not-a-boolean', // Should be boolean
        variables: 'not-an-array', // Should be array
      };

      mockNativeModule.getFlag.mockResolvedValue(malformedData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      // The SDK should handle malformed data gracefully
      expect(result.isEnabled()).toBe('not-a-boolean');
      expect(result.getVariables()).toBe('not-an-array');
    });


  });

  describe('Performance and edge cases', () => {
    it('should handle large number of variables efficiently', async () => {
      const largeVariables = Array.from({ length: 1000 }, (_, i) => ({
        key: `var${i}`,
        value: `value${i}`,
        type: 'string',
        id: i,
      }));

      const mockFlagData = {
        isEnabled: true,
        variables: largeVariables,
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const result = await vwoInstance.getFlag('test-feature', mockUserContext);

      expect(result.getVariables()).toHaveLength(1000);
      expect(result.getVariable('var500', 'default')).toBe('value500');
      expect(result.getVariable('var999', 'default')).toBe('value999');
    });

    it('should handle concurrent getFlag calls', async () => {
      const mockFlagData = {
        isEnabled: true,
        variables: [{ key: 'test', value: 'value', type: 'string', id: 1 }],
      };

      mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

      const promises = [
        vwoInstance.getFlag('feature1', mockUserContext),
        vwoInstance.getFlag('feature2', mockUserContext),
        vwoInstance.getFlag('feature3', mockUserContext),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.isEnabled()).toBe(true);
        expect(result.getVariable('test', 'default')).toBe('value');
      });
    });
  });
});
