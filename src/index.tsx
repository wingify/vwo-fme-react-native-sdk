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
import type { VWOInitOptions, VWOContext, GetFlagResult } from './types';

const LINKING_ERROR =
  `The package 'vwo-fme-react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const VwoFmeReactNativeSdk = NativeModules.VwoFmeReactNativeSdk
  ? NativeModules.VwoFmeReactNativeSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// Create an event emitter for the native module to handle events from the native side.
const myModuleEmitter = new NativeEventEmitter(VwoFmeReactNativeSdk);
const logListener = myModuleEmitter.addListener('LogEvent', (event) => {
  const { message, type } = event;
  switch (type) {
    case 'INFO':
    case 'DEBUG':
    case 'TRACE':
      console.log(message);
      break;
    case 'WARN':
      console.warn(message);
      break;
    case 'ERROR':
      console.error(message);
      break;
    default:
      console.log(message);
  }
});

// VWO interface to interact with the native module
const VWONative: VWOBridgeInterface = VwoFmeReactNativeSdk;

// Interface defining the methods available in the bridge
interface VWOBridgeInterface {
  initialize(options: VWOInitOptions): Promise<string>;

  getFlag(featureKey: string, context: VWOContext): Promise<GetFlagResult>;

  trackEvent(
    eventName: string,
    context: VWOContext,
    eventProperties?: { [key: string]: any }
  ): void;

  setAttribute(
    attributes: { [key: string]: any },
    context: VWOContext
  ): Promise<any>;

  setSessionData(data: { [key: string]: any }): void;
}

// Determine the platform (iOS or Android) to handle platform-specific logic.
// const platform = Platform.OS;
// const platformAndroid = platform === 'android' ? true : false;

// Initialize the SDK with the provided options
export async function init(options: VWOInitOptions): Promise<any> {
  try {
    const vwoInstance = new VWO();
    await VWONative.initialize(options);
    // console.log('VWO initialized:', message);
    return vwoInstance;
  } catch (error) {
    console.error('Failed to initialize VWO:', error);
    throw error;
  }
}

// Main class to interact with the SDK
// This class provides methods to initialize the SDK, manage feature flags, track events, and set user attributes.
export class VWO {
  // Get the flag value for the given feature key
  getFlag = async (
    featureKey: string,
    context: VWOContext
  ): Promise<GetFlagResult> => {
    try {
      const flag: any = await VWONative.getFlag(featureKey, context);

      const result = {
        isEnabled: function () {
          return flag.isEnabled;
        },
        getVariable: function (variableKey: string, defaultValue: any) {
          for (const variable of flag.variables) {
            if (variable.key === variableKey) {
              return variable.value !== undefined
                ? variable.value
                : defaultValue;
            }
          }
          return defaultValue;
        },
        getVariables: function () {
          return flag.variables;
        },
      };
      return result;
    } catch (error) {
      console.error('Failed to get feature flag:', error);
      throw error;
    }
  };

  // Track an event with properties
  trackEvent = (
    eventName: string,
    context: VWOContext,
    eventProperties?: { [key: string]: any }
  ): void => {
    try {
      VWONative.trackEvent(eventName, context, eventProperties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  // Set attributes for a user in the context provided
  setAttribute = async (
    attributes: { [key: string]: any },
    context: VWOContext
  ): Promise<any> => {
    try {
      VWONative.setAttribute(attributes, context);
    } catch (error) {
      console.error('Failed to set attribute:', error);
    }
  };

  // Sets the session data for the current FME session.
  setSessionData = async (data: { [key: string]: any }) => {
    VWONative.setSessionData(data);
  };

  // Register a callback for integration event
  static registerIntegrationCallback(
    callback: (properties: { [key: string]: any }) => void
  ) {
    const subscription = myModuleEmitter.addListener(
      'IntegrationCallbackEvent',
      callback
    );
    return () => subscription.remove();
  }

  cleanup?: () => void = () => {
    logListener.remove();
  };
}
