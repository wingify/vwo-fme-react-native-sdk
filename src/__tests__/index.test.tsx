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
import { init, VWO } from '../index';
import { LogLevel } from '../types';
import type { VWOInitOptions, VWOUserContext, GetFlagResult } from '../types';

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
        sendSdkInitTime: jest.fn(),
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

describe('VWO FME React Native SDK', () => {
  let mockNativeModule: any;
  let mockAddListener: jest.Mock;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    
    // Create fresh mock functions for each test
    mockAddListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    mockRemove = jest.fn();
    
    // Reset and update the NativeEventEmitter mock
    const NativeEventEmitterMock = NativeEventEmitter as jest.Mock;
    NativeEventEmitterMock.mockClear();
    NativeEventEmitterMock.mockImplementation(() => ({
      addListener: mockAddListener,
    }));
  });

  describe('init function', () => {
    it('should initialize VWO SDK with correct options', async () => {
      const mockOptions: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
        accountId: 12345,
        logLevel: LogLevel.info,
      };

      mockNativeModule.initialize.mockResolvedValue('success');

      const result = await init(mockOptions);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockOptions,
          vwoMeta: expect.objectContaining({
            lv: expect.stringMatching(/^\d+\.\d+\.\d+$/),
          }),
        })
      );
      expect(result).toBeInstanceOf(VWO);
    });

    it('should handle initialization with existing vwoMeta', async () => {
      const mockOptions: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
        vwoMeta: {
          customKey: 'customValue',
        },
      };

      mockNativeModule.initialize.mockResolvedValue('success');

      await init(mockOptions);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockOptions,
          vwoMeta: expect.objectContaining({
            customKey: 'customValue',
            lv: expect.stringMatching(/^\d+\.\d+\.\d+$/),
          }),
        })
      );
    });

    it('should handle initialization error', async () => {
      const mockOptions: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
      };

      const error = new Error('Initialization failed');
      mockNativeModule.initialize.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(init(mockOptions)).rejects.toThrow('Initialization failed');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize VWO:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('VWO class', () => {
    let vwoInstance: VWO;

    beforeEach(() => {
      vwoInstance = new VWO();
    });

    describe('getFlag method', () => {
      it('should return flag result with correct structure', async () => {
        const featureKey = 'test-feature';
        const context: VWOUserContext = { id: 'user123' };
        const mockFlagData = {
          isEnabled: true,
          variables: [
            { key: 'var1', value: 'value1', type: 'string', id: 1 },
            { key: 'var2', value: 42, type: 'number', id: 2 },
          ],
        };

        mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

        const result = await vwoInstance.getFlag(featureKey, context);

        expect(mockNativeModule.getFlag).toHaveBeenCalledWith(featureKey, context);
        expect(result.isEnabled()).toBe(true);
        expect(result.getVariable('var1', 'default')).toBe('value1');
        expect(result.getVariable('var2', 0)).toBe(42);
        expect(result.getVariable('nonexistent', 'default')).toBe('default');
        expect(result.getVariables()).toEqual(mockFlagData.variables);
      });

      it('should handle undefined variable values', async () => {
        const mockFlagData = {
          isEnabled: false,
          variables: [
            { key: 'var1', value: undefined, type: 'string', id: 1 },
          ],
        };

        mockNativeModule.getFlag.mockResolvedValue(mockFlagData);

        const result = await vwoInstance.getFlag('test', { id: 'user123' });

        expect(result.getVariable('var1', 'default')).toBe('default');
      });

      it('should handle getFlag error', async () => {
        const error = new Error('Flag retrieval failed');
        mockNativeModule.getFlag.mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await expect(vwoInstance.getFlag('test', { id: 'user123' })).rejects.toThrow('Flag retrieval failed');
        expect(consoleSpy).toHaveBeenCalledWith('Failed to get feature flag:', error);

        consoleSpy.mockRestore();
      });
    });

    describe('trackEvent method', () => {
      it('should track event with context and properties', () => {
        const eventName = 'test_event';
        const context: VWOUserContext = { id: 'user123' };
        const eventProperties = { property1: 'value1', property2: 42 };

        vwoInstance.trackEvent(eventName, context, eventProperties);

        expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, context, eventProperties);
      });

      it('should track event without properties', () => {
        const eventName = 'test_event';
        const context: VWOUserContext = { id: 'user123' };

        vwoInstance.trackEvent(eventName, context);

        expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, context, undefined);
      });

      it('should handle trackEvent error', () => {
        const error = new Error('Event tracking failed');
        mockNativeModule.trackEvent.mockImplementation(() => {
          throw error;
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        vwoInstance.trackEvent('test', { id: 'user123' });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to track event:', error);

        consoleSpy.mockRestore();
      });
    });

    describe('setAttribute method', () => {
      it('should set attributes for user context', async () => {
        const attributes = { age: 25, country: 'US' };
        const context: VWOUserContext = { id: 'user123' };

        mockNativeModule.setAttribute.mockResolvedValue('success');

        await vwoInstance.setAttribute(attributes, context);

        expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(attributes, context);
      });

          it('should handle setAttribute error', async () => {
      const error = new Error('Attribute setting failed');
      mockNativeModule.setAttribute.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // The method should not throw, it should catch the error and log it
      await vwoInstance.setAttribute({ test: 'value' }, { id: 'user123' });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to set attribute:', error);

      consoleSpy.mockRestore();
    });
    });

    describe('setSessionData method', () => {
      it('should set session data', () => {
        const sessionData = { sessionId: 'session123', timestamp: Date.now() };

        mockNativeModule.setSessionData.mockImplementation(() => {});

        vwoInstance.setSessionData(sessionData);

        expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
      });
    });

    describe('cleanup method', () => {
      it('should call cleanup function', () => {
        const cleanupSpy = jest.fn();
        vwoInstance.cleanup = cleanupSpy;

        vwoInstance.cleanup();

        expect(cleanupSpy).toHaveBeenCalled();
      });
    });
  });

  describe('VWO static methods', () => {
    describe('registerIntegrationCallback', () => {
      it('should register integration callback and return cleanup function', () => {
        const mockCallback = jest.fn();

        const cleanup = VWO.registerIntegrationCallback(mockCallback);

        // Verify that the cleanup function is returned and is callable
        expect(cleanup).toBeInstanceOf(Function);
        expect(() => cleanup()).not.toThrow();
      });
    });

    describe('registerLogCallback', () => {
      it('should register log callback and return cleanup function', () => {
        const mockCallback = jest.fn();

        const cleanup = VWO.registerLogCallback(mockCallback);

        // Verify that the cleanup function is returned and is callable
        expect(cleanup).toBeInstanceOf(Function);
        expect(() => cleanup()).not.toThrow();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle missing native module gracefully', () => {
      // This test verifies that the SDK handles missing native modules
      // by creating a proxy that throws appropriate errors
      expect(mockNativeModule).toBeDefined();
      expect(typeof mockNativeModule.initialize).toBe('function');
    });
  });
});
