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

import { NativeModules } from 'react-native';
import { VWO } from '../index';

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

describe('SetSessionData Functionality Tests', () => {
  let mockNativeModule: any;
  let vwoInstance: VWO;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    vwoInstance = new VWO();
  });

  describe('Basic session data setting', () => {
    it('should set basic session data', () => {
      const sessionData = {
        sessionId: 'session_123',
        timestamp: Date.now(),
        userId: 'user_456',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with string values', () => {
      const sessionData = {
        sessionId: 'session_123',
        userId: 'user_456',
        deviceId: 'device_789',
        appVersion: '1.2.3',
        platform: 'ios',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with numeric values', () => {
      const sessionData = {
        sessionId: 'session_123',
        timestamp: 1704067200000,
        duration: 3600,
        pageViews: 5,
        score: 95.5,
        negativeValue: -10,
        zero: 0,
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with boolean values', () => {
      const sessionData = {
        sessionId: 'session_123',
        isLoggedIn: true,
        isFirstTime: false,
        hasPermission: true,
        isActive: false,
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set empty session data object', () => {
      const sessionData = {};

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('Complex session data types', () => {
    it('should set session data with array values', () => {
      const sessionData = {
        sessionId: 'session_123',
        visitedPages: ['home', 'products', 'cart', 'checkout'],
        actions: ['click', 'scroll', 'search', 'purchase'],
        scores: [85, 92, 78, 95],
        mixed: ['string', 42, true, null],
        empty: [],
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with object values', () => {
      const sessionData = {
        sessionId: 'session_123',
        user: {
          id: 'user_456',
          name: 'John Doe',
          email: 'john@example.com',
        },
        device: {
          model: 'iPhone 14',
          os: 'iOS 17.0',
          screen: '1170x2532',
        },
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with deeply nested objects', () => {
      const sessionData = {
        sessionId: 'session_123',
        analytics: {
          events: {
            pageViews: {
              home: 3,
              products: 5,
              cart: 1,
            },
            conversions: {
              purchases: 1,
              signups: 0,
            },
          },
          metrics: {
            timeSpent: 1800,
            bounceRate: 0.25,
          },
        },
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should set session data with null and undefined values', () => {
      const sessionData = {
        sessionId: 'session_123',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('Session data key variations', () => {
    it('should handle different key formats', () => {
      const sessionData = {
        'simple_key': 'value',
        'key_with_underscores': 'value',
        'key-with-dashes': 'value',
        'key.with.dots': 'value',
        'key with spaces': 'value',
        'KEY_IN_UPPERCASE': 'value',
        'key123': 'value',
        '123key': 'value',
        'key-with-123-numbers': 'value',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle empty string keys', () => {
      const sessionData = {
        '': 'empty-key-value',
        'normalKey': 'normal-value',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle special characters in keys', () => {
      const sessionData = {
        'key-with-special-chars!@#$%^&*()': 'value',
        'key_with_unicode_ñáéíóú': 'value',
        'key_with_emoji_🎉': 'value',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle null session data', () => {
      vwoInstance.setSessionData(null as any);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(null);
    });

    it('should handle undefined session data', () => {
      vwoInstance.setSessionData(undefined as any);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(undefined);
    });

    it('should handle non-object session data', () => {
      const nonObjectData = [
        'string',
        42,
        true,
        null,
        undefined,
        () => 'function',
      ];

      nonObjectData.forEach((data) => {
        vwoInstance.setSessionData(data as any);
        expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(data);
      });
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large session data objects efficiently', () => {
      const largeSessionData = {
        sessionId: 'session_123',
        largeArray: Array.from({ length: 10000 }, (_, i) => `item${i}`),
        largeObject: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
        ),
      };

      vwoInstance.setSessionData(largeSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        largeSessionData
      );
    });

    it('should handle concurrent setSessionData calls', () => {
      const sessionDataSets = [
        { sessionId: 'session1', data: 'value1' },
        { sessionId: 'session2', data: 'value2' },
        { sessionId: 'session3', data: 'value3' },
      ];

      sessionDataSets.forEach((data) => {
        vwoInstance.setSessionData(data);
      });

      expect(mockNativeModule.setSessionData).toHaveBeenCalledTimes(3);
      sessionDataSets.forEach((data, index) => {
        expect(mockNativeModule.setSessionData).toHaveBeenNthCalledWith(
          index + 1,
          data
        );
      });
    });

    it('should handle circular references in session data', () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      const sessionData = {
        sessionId: 'session_123',
        circular: circularObject,
        normal: 'value',
      };

      // This should not cause infinite recursion
      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle functions in session data', () => {
      const sessionData = {
        sessionId: 'session_123',
        callback: () => 'test',
        asyncFunction: async () => 'async_test',
        normalValue: 'string',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('Real-world session data scenarios', () => {
    it('should set user session data', () => {
      const userSessionData = {
        sessionId: 'session_123',
        userId: 'user_456',
        timestamp: Date.now(),
        isLoggedIn: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        ipAddress: '192.168.1.1',
        location: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/Los_Angeles',
        },
      };

      vwoInstance.setSessionData(userSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        userSessionData
      );
    });

    it('should set e-commerce session data', () => {
      const ecommerceSessionData = {
        sessionId: 'session_123',
        cart: {
          itemCount: 3,
          totalValue: 299.99,
          items: [
            { productId: 'prod_1', quantity: 2, price: 99.99 },
            { productId: 'prod_2', quantity: 1, price: 100.01 },
          ],
        },
        browsing: {
          categories: ['electronics', 'books'],
          searchTerms: ['laptop', 'wireless'],
          timeSpent: 1800, // seconds
        },
        conversion: {
          funnel: ['home', 'products', 'cart', 'checkout'],
          abandonedAt: null,
          completed: false,
        },
      };

      vwoInstance.setSessionData(ecommerceSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        ecommerceSessionData
      );
    });

    it('should set app usage session data', () => {
      const appUsageSessionData = {
        sessionId: 'session_123',
        app: {
          version: '1.2.3',
          build: '456',
          platform: 'ios',
          deviceModel: 'iPhone 14',
          osVersion: '17.0',
        },
        usage: {
          startTime: Date.now(),
          duration: 3600, // seconds
          screens: ['home', 'profile', 'settings', 'home'],
          actions: ['tap', 'swipe', 'scroll', 'tap'],
          features: ['search', 'favorites', 'notifications'],
        },
        performance: {
          loadTime: 2.5,
          memoryUsage: 150, // MB
          batteryLevel: 0.75,
          networkType: 'wifi',
        },
      };

      vwoInstance.setSessionData(appUsageSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        appUsageSessionData
      );
    });

    it('should set A/B testing session data', () => {
      const abTestingSessionData = {
        sessionId: 'session_123',
        experiments: {
          exp_123: {
            variation: 'var_a',
            isControl: false,
            exposureTime: Date.now(),
            goals: {
              goal_1: { count: 2, value: 100.0 },
              goal_2: { count: 1, value: 50.0 },
            },
          },
          exp_456: {
            variation: 'var_b',
            isControl: true,
            exposureTime: Date.now(),
            goals: {
              goal_1: { count: 1, value: 75.0 },
            },
          },
        },
        segments: {
          userType: 'premium',
          location: 'US',
          deviceType: 'mobile',
          browser: 'safari',
        },
        metrics: {
          pageViews: 8,
          timeOnSite: 1200,
          bounceRate: 0.25,
        },
      };

      vwoInstance.setSessionData(abTestingSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        abTestingSessionData
      );
    });
  });

  describe('Session data validation and sanitization', () => {
    it('should handle very long session data values', () => {
      const longString = 'a'.repeat(10000);
      const sessionData = {
        sessionId: 'session_123',
        longValue: longString,
        normalValue: 'normal',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle very deep nested objects', () => {
      const deepObject: any = {};
      let current = deepObject;
      for (let i = 0; i < 100; i++) {
        current.level = { value: i };
        current = current.level;
      }

      const sessionData = {
        sessionId: 'session_123',
        deepNested: deepObject,
        normal: 'value',
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle mixed data types in arrays', () => {
      const sessionData = {
        sessionId: 'session_123',
        mixedArray: [
          'string',
          42,
          true,
          null,
          undefined,
          { nested: 'object' },
          [1, 2, 3],
          () => 'function',
        ],
      };

      vwoInstance.setSessionData(sessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(sessionData);
    });

    it('should handle session data with all data types', () => {
      const comprehensiveSessionData = {
        sessionId: 'session_123',
        stringValue: 'test string',
        numberValue: 42,
        floatValue: 3.14159,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        negativeNumber: -10,
        arrayValue: ['item1', 'item2', 'item3'],
        objectValue: { key: 'value', nested: { deep: 'value' } },
        functionValue: () => 'test',
        dateValue: new Date(),
        regexValue: /test/,
        symbolValue: Symbol('test'),
      };

      vwoInstance.setSessionData(comprehensiveSessionData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        comprehensiveSessionData
      );
    });
  });

  describe('Session data lifecycle scenarios', () => {
    it('should handle session start data', () => {
      const sessionStartData = {
        sessionId: 'session_123',
        startTime: Date.now(),
        userId: 'user_456',
        deviceInfo: {
          model: 'iPhone 14',
          os: 'iOS 17.0',
          screen: '1170x2532',
        },
        appInfo: {
          version: '1.2.3',
          build: '456',
        },
      };

      vwoInstance.setSessionData(sessionStartData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        sessionStartData
      );
    });

    it('should handle session update data', () => {
      const sessionUpdateData = {
        sessionId: 'session_123',
        lastActivity: Date.now(),
        pageViews: 5,
        actions: ['click', 'scroll', 'search'],
        currentPage: 'products',
      };

      vwoInstance.setSessionData(sessionUpdateData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        sessionUpdateData
      );
    });

    it('should handle session end data', () => {
      const sessionEndData = {
        sessionId: 'session_123',
        endTime: Date.now(),
        duration: 3600,
        totalActions: 25,
        conversion: {
          completed: true,
          value: 299.99,
          items: ['prod_1', 'prod_2'],
        },
        summary: {
          pagesVisited: ['home', 'products', 'cart', 'checkout'],
          timeSpent: 3600,
          bounceRate: 0.0,
        },
      };

      vwoInstance.setSessionData(sessionEndData);

      expect(mockNativeModule.setSessionData).toHaveBeenCalledWith(
        sessionEndData
      );
    });
  });
});
