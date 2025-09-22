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
import type { VWOUserContext } from '../types';

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

describe('SetAttribute Functionality Tests', () => {
  let mockNativeModule: any;
  let vwoInstance: VWO;
  let mockUserContext: VWOUserContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    vwoInstance = new VWO();
    mockUserContext = { id: 'test-user-123' };
  });

  describe('Basic attribute setting', () => {
    it('should set basic string attributes', async () => {
      const attributes = {
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'premium',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set numeric attributes', async () => {
      const attributes = {
        age: 25,
        score: 95.5,
        visits: 42,
        negativeValue: -10,
        zero: 0,
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set boolean attributes', async () => {
      const attributes = {
        isSubscribed: true,
        isVerified: false,
        hasPermission: true,
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set empty attributes object', async () => {
      const attributes = {};

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });
  });

  describe('Complex attribute types', () => {
    it('should set array attributes', async () => {
      const attributes = {
        interests: ['sports', 'music', 'technology'],
        scores: [85, 92, 78, 95],
        mixed: ['string', 42, true, null],
        empty: [],
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set object attributes', async () => {
      const attributes = {
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
        },
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set deeply nested object attributes', async () => {
      const attributes = {
        user: {
          profile: {
            personal: {
              name: 'John',
              details: {
                age: 25,
                location: {
                  country: 'US',
                  city: 'New York',
                },
              },
            },
          },
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should set null and undefined attributes', async () => {
      const attributes = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });
  });

  describe('Attribute key variations', () => {
    it('should handle different key formats', async () => {
      const attributes = {
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

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should handle empty string keys', async () => {
      const attributes = {
        '': 'empty-key-value',
        'normalKey': 'normal-value',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should handle special characters in keys', async () => {
      const attributes = {
        'key-with-special-chars!@#$%^&*()': 'value',
        'key_with_unicode_ñáéíóú': 'value',
        'key_with_emoji_🎉': 'value',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });
  });

  describe('User context variations', () => {
    it('should work with user context containing custom variables', async () => {
      const attributes = { plan: 'premium' };
      const contextWithCustomVars: VWOUserContext = {
        id: 'user123',
        customVariables: {
          plan: 'premium',
          age: 25,
          country: 'US',
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, contextWithCustomVars);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        contextWithCustomVars
      );
    });

    it('should work with user context containing only ID', async () => {
      const attributes = { status: 'active' };
      const contextWithIdOnly: VWOUserContext = {
        id: 'user456',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, contextWithIdOnly);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        contextWithIdOnly
      );
    });

    it('should work with empty user context', async () => {
      const attributes = { anonymous: true };
      const emptyContext: VWOUserContext = {};

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, emptyContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        emptyContext
      );
    });

    it('should work with user context containing special characters', async () => {
      const attributes = { special: 'value' };
      const contextWithSpecialChars: VWOUserContext = {
        id: 'user-with-dashes',
        customVariables: {
          'key-with-dashes': 'value',
          'key_with_underscores': 'value',
          'key.with.dots': 'value',
          'key with spaces': 'value',
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, contextWithSpecialChars);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        contextWithSpecialChars
      );
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle native module errors gracefully', async () => {
      const error = new Error('Native module error');
      mockNativeModule.setAttribute.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await vwoInstance.setAttribute({ test: 'value' }, mockUserContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to set attribute:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('should handle null attributes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await vwoInstance.setAttribute(null as any, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        null,
        mockUserContext
      );

      consoleSpy.mockRestore();
    });

    it('should handle undefined attributes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await vwoInstance.setAttribute(undefined as any, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        undefined,
        mockUserContext
      );

      consoleSpy.mockRestore();
    });

    it('should handle null user context', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await vwoInstance.setAttribute({ test: 'value' }, null as any);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        { test: 'value' },
        null
      );

      consoleSpy.mockRestore();
    });

    it('should handle undefined user context', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await vwoInstance.setAttribute({ test: 'value' }, undefined as any);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        { test: 'value' },
        undefined
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large attribute objects efficiently', async () => {
      const largeAttributes = {
        largeArray: Array.from({ length: 10000 }, (_, i) => `item${i}`),
        largeObject: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
        ),
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(largeAttributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        largeAttributes,
        mockUserContext
      );
    });

    it('should handle concurrent setAttribute calls', async () => {
      const attributeSets = [
        { attributes: { set1: 'value1' }, context: { id: 'user1' } },
        { attributes: { set2: 'value2' }, context: { id: 'user2' } },
        { attributes: { set3: 'value3' }, context: { id: 'user3' } },
      ];

      mockNativeModule.setAttribute.mockResolvedValue('success');

      const promises = attributeSets.map(({ attributes, context }) =>
        vwoInstance.setAttribute(attributes, context)
      );

      await Promise.all(promises);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledTimes(3);
      attributeSets.forEach(({ attributes, context }, index) => {
        expect(mockNativeModule.setAttribute).toHaveBeenNthCalledWith(
          index + 1,
          attributes,
          context
        );
      });
    });

    it('should handle circular references in attributes', async () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      const attributes = {
        circular: circularObject,
        normal: 'value',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      // This should not cause infinite recursion
      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should handle functions in attributes', async () => {
      const attributes = {
        callback: () => 'test',
        asyncFunction: async () => 'async_test',
        normalValue: 'string',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });
  });

  describe('Real-world attribute scenarios', () => {
    it('should set user profile attributes', async () => {
      const userProfileAttributes = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 30,
        gender: 'male',
        location: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
        },
        subscription: {
          plan: 'premium',
          startDate: '2024-01-01',
          isActive: true,
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(userProfileAttributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        userProfileAttributes,
        mockUserContext
      );
    });

    it('should set e-commerce attributes', async () => {
      const ecommerceAttributes = {
        customer: {
          id: 'cust_123',
          tier: 'gold',
          totalSpent: 1500.0,
          lastPurchase: '2024-01-15',
        },
        cart: {
          itemCount: 3,
          totalValue: 299.99,
          items: [
            { productId: 'prod_1', quantity: 2, price: 99.99 },
            { productId: 'prod_2', quantity: 1, price: 100.01 },
          ],
        },
        preferences: {
          preferredCategories: ['electronics', 'books'],
          preferredBrands: ['Apple', 'Samsung'],
          priceRange: { min: 10, max: 500 },
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(ecommerceAttributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        ecommerceAttributes,
        mockUserContext
      );
    });

    it('should set app usage attributes', async () => {
      const appUsageAttributes = {
        app: {
          version: '1.2.3',
          build: '456',
          platform: 'ios',
        },
        usage: {
          sessionsCount: 25,
          totalTimeSpent: 3600, // seconds
          lastActive: Date.now(),
          featuresUsed: ['search', 'favorites', 'notifications'],
        },
        device: {
          model: 'iPhone 14',
          osVersion: '17.0',
          screenResolution: '1170x2532',
          networkType: 'wifi',
        },
        engagement: {
          dailyActive: true,
          weeklyActive: true,
          monthlyActive: true,
          pushEnabled: true,
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(appUsageAttributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        appUsageAttributes,
        mockUserContext
      );
    });

    it('should set A/B testing attributes', async () => {
      const abTestingAttributes = {
        experiments: {
          exp_123: {
            variation: 'var_a',
            isControl: false,
            exposureTime: Date.now(),
          },
          exp_456: {
            variation: 'var_b',
            isControl: true,
            exposureTime: Date.now(),
          },
        },
        goals: {
          goal_123: {
            count: 5,
            value: 250.0,
            lastAchieved: Date.now(),
          },
        },
        segments: {
          userType: 'premium',
          location: 'US',
          deviceType: 'mobile',
        },
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(abTestingAttributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        abTestingAttributes,
        mockUserContext
      );
    });
  });

  describe('Attribute validation and sanitization', () => {
    it('should handle very long attribute values', async () => {
      const longString = 'a'.repeat(10000);
      const attributes = {
        longValue: longString,
        normalValue: 'normal',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should handle very deep nested objects', async () => {
      const deepObject: any = {};
      let current = deepObject;
      for (let i = 0; i < 100; i++) {
        current.level = { value: i };
        current = current.level;
      }

      const attributes = {
        deepNested: deepObject,
        normal: 'value',
      };

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });

    it('should handle mixed data types in arrays', async () => {
      const attributes = {
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

      mockNativeModule.setAttribute.mockResolvedValue('success');

      await vwoInstance.setAttribute(attributes, mockUserContext);

      expect(mockNativeModule.setAttribute).toHaveBeenCalledWith(
        attributes,
        mockUserContext
      );
    });
  });
});
