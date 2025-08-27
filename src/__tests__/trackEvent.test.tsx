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

describe('TrackEvent Functionality Tests', () => {
  let mockNativeModule: any;
  let vwoInstance: VWO;
  let mockUserContext: VWOUserContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule = NativeModules.VwoFmeReactNativeSdk;
    vwoInstance = new VWO();
    mockUserContext = { id: 'test-user-123' };
  });

  describe('Basic event tracking', () => {
    it('should track event with basic parameters', () => {
      const eventName = 'test_event';
      const context: VWOUserContext = { id: 'user123' };

      vwoInstance.trackEvent(eventName, context);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, context, undefined);
    });

    it('should track event with event properties', () => {
      const eventName = 'purchase_completed';
      const context: VWOUserContext = { id: 'user123' };
      const eventProperties = {
        productId: 'prod_123',
        price: 99.99,
        currency: 'USD',
      };

      vwoInstance.trackEvent(eventName, context, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, context, eventProperties);
    });

    it('should track event without user context', () => {
      const eventName = 'app_opened';
      const emptyContext: VWOUserContext = {};

      vwoInstance.trackEvent(eventName, emptyContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, emptyContext, undefined);
    });
  });

  describe('Event name variations', () => {
    it('should handle different event name formats', () => {
      const eventNames = [
        'simple_event',
        'event_with_underscores',
        'event.with.dots',
        'event with spaces',
        'EVENT_IN_UPPERCASE',
        'event123',
        '123event',
        'event-with-dashes',
        'event_with_123_numbers',
      ];

      eventNames.forEach(eventName => {
        vwoInstance.trackEvent(eventName, mockUserContext);
        expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, undefined);
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledTimes(eventNames.length);
    });

    it('should handle empty event name', () => {
      vwoInstance.trackEvent('', mockUserContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith('', mockUserContext, undefined);
    });

    it('should handle very long event names', () => {
      const longEventName = 'a'.repeat(1000);
      vwoInstance.trackEvent(longEventName, mockUserContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(longEventName, mockUserContext, undefined);
    });
  });

  describe('Event properties variations', () => {
    it('should handle string properties', () => {
      const eventName = 'user_action';
      const eventProperties = {
        action: 'click',
        element: 'button',
        page: 'homepage',
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle numeric properties', () => {
      const eventName = 'metric_tracked';
      const eventProperties = {
        count: 42,
        percentage: 75.5,
        score: -10,
        zero: 0,
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle boolean properties', () => {
      const eventName = 'feature_used';
      const eventProperties = {
        isEnabled: true,
        isVisible: false,
        hasPermission: true,
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle null and undefined properties', () => {
      const eventName = 'data_collected';
      const eventProperties = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle array properties', () => {
      const eventName = 'items_selected';
      const eventProperties = {
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3, 4, 5],
        mixed: ['string', 42, true, null],
        empty: [],
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle nested object properties', () => {
      const eventName = 'complex_event';
      const eventProperties = {
        user: {
          id: 'user123',
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
        metadata: {
          timestamp: Date.now(),
          source: 'mobile_app',
        },
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle deeply nested objects', () => {
      const eventName = 'deep_nested_event';
      const eventProperties = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep_value',
                },
              },
            },
          },
        },
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });
  });

  describe('User context variations', () => {
    it('should work with user context containing custom variables', () => {
      const eventName = 'custom_event';
      const contextWithCustomVars: VWOUserContext = {
        id: 'user123',
        customVariables: {
          plan: 'premium',
          age: 25,
          country: 'US',
          isSubscribed: true,
        },
      };

      vwoInstance.trackEvent(eventName, contextWithCustomVars);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, contextWithCustomVars, undefined);
    });

    it('should work with user context containing only ID', () => {
      const eventName = 'simple_event';
      const contextWithIdOnly: VWOUserContext = {
        id: 'user456',
      };

      vwoInstance.trackEvent(eventName, contextWithIdOnly);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, contextWithIdOnly, undefined);
    });

    it('should work with empty user context', () => {
      const eventName = 'anonymous_event';
      const emptyContext: VWOUserContext = {};

      vwoInstance.trackEvent(eventName, emptyContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, emptyContext, undefined);
    });

    it('should work with user context containing special characters', () => {
      const eventName = 'special_chars_event';
      const contextWithSpecialChars: VWOUserContext = {
        id: 'user-with-dashes',
        customVariables: {
          'key-with-dashes': 'value',
          'key_with_underscores': 'value',
          'key.with.dots': 'value',
          'key with spaces': 'value',
        },
      };

      vwoInstance.trackEvent(eventName, contextWithSpecialChars);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, contextWithSpecialChars, undefined);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle native module errors gracefully', () => {
      const error = new Error('Native module error');
      mockNativeModule.trackEvent.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        vwoInstance.trackEvent('test_event', mockUserContext);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to track event:', error);

      consoleSpy.mockRestore();
    });

    it('should handle null event name', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      vwoInstance.trackEvent(null as any, mockUserContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(null, mockUserContext, undefined);

      consoleSpy.mockRestore();
    });

    it('should handle undefined event name', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      vwoInstance.trackEvent(undefined as any, mockUserContext);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(undefined, mockUserContext, undefined);

      consoleSpy.mockRestore();
    });

    it('should handle null user context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      vwoInstance.trackEvent('test_event', null as any);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith('test_event', null, undefined);

      consoleSpy.mockRestore();
    });

    it('should handle undefined user context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      vwoInstance.trackEvent('test_event', undefined as any);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith('test_event', undefined, undefined);

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large event properties efficiently', () => {
      const eventName = 'large_data_event';
      const largeProperties = {
        largeArray: Array.from({ length: 10000 }, (_, i) => `item${i}`),
        largeObject: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
        ),
      };

      vwoInstance.trackEvent(eventName, mockUserContext, largeProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, largeProperties);
    });

    it('should handle concurrent event tracking', () => {
      const events = [
        { name: 'event1', context: { id: 'user1' } },
        { name: 'event2', context: { id: 'user2' } },
        { name: 'event3', context: { id: 'user3' } },
      ];

      events.forEach(event => {
        vwoInstance.trackEvent(event.name, event.context);
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledTimes(3);
      events.forEach((event, index) => {
        expect(mockNativeModule.trackEvent).toHaveBeenNthCalledWith(
          index + 1,
          event.name,
          event.context,
          undefined
        );
      });
    });

    it('should handle circular references in event properties', () => {
      const eventName = 'circular_event';
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      const eventProperties = {
        circular: circularObject,
        normal: 'value',
      };

      // This should not cause infinite recursion
      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });

    it('should handle functions in event properties', () => {
      const eventName = 'function_event';
      const eventProperties = {
        callback: () => 'test',
        asyncFunction: async () => 'async_test',
        normalValue: 'string',
      };

      vwoInstance.trackEvent(eventName, mockUserContext, eventProperties);

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(eventName, mockUserContext, eventProperties);
    });
  });

  describe('Real-world event scenarios', () => {
    it('should track e-commerce events', () => {
      const ecommerceEvents = [
        {
          name: 'product_viewed',
          properties: {
            productId: 'prod_123',
            productName: 'Test Product',
            category: 'Electronics',
            price: 99.99,
            currency: 'USD',
          },
        },
        {
          name: 'add_to_cart',
          properties: {
            productId: 'prod_123',
            quantity: 2,
            price: 99.99,
            total: 199.98,
          },
        },
        {
          name: 'purchase_completed',
          properties: {
            orderId: 'order_456',
            total: 199.98,
            currency: 'USD',
            paymentMethod: 'credit_card',
            items: [
              { productId: 'prod_123', quantity: 2, price: 99.99 },
            ],
          },
        },
      ];

      ecommerceEvents.forEach(event => {
        vwoInstance.trackEvent(event.name, mockUserContext, event.properties);
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledTimes(3);
    });

    it('should track user engagement events', () => {
      const engagementEvents = [
        {
          name: 'app_opened',
          properties: {
            source: 'push_notification',
            timestamp: Date.now(),
          },
        },
        {
          name: 'feature_used',
          properties: {
            featureName: 'search',
            usageCount: 5,
            isFirstTime: false,
          },
        },
        {
          name: 'screen_viewed',
          properties: {
            screenName: 'product_details',
            timeSpent: 120,
            isLoggedIn: true,
          },
        },
      ];

      engagementEvents.forEach(event => {
        vwoInstance.trackEvent(event.name, mockUserContext, event.properties);
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledTimes(3);
    });

    it('should track A/B testing events', () => {
      const abTestingEvents = [
        {
          name: 'experiment_viewed',
          properties: {
            experimentId: 'exp_123',
            variationId: 'var_a',
            isControl: false,
          },
        },
        {
          name: 'conversion',
          properties: {
            experimentId: 'exp_123',
            variationId: 'var_a',
            goalId: 'goal_456',
            value: 99.99,
          },
        },
      ];

      abTestingEvents.forEach(event => {
        vwoInstance.trackEvent(event.name, mockUserContext, event.properties);
      });

      expect(mockNativeModule.trackEvent).toHaveBeenCalledTimes(2);
    });
  });
});

