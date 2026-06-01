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

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { VWOInitOptions, VWOUserContext, GetFlagResult } from './types';
import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_DELAY_MS,
  DEFAULT_INIT_TIMEOUT_MS,
} from './constants';

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

/**
 * Event emitter instance for the native VWO module.
 * Handles communication of log and integration events from the native side to JavaScript.
 */
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
      break;
  }
});

/** Native VWO bridge instance, typed to the {@link VWOBridgeInterface}. */
const VWONative: VWOBridgeInterface = VwoFmeReactNativeSdk;

/**
 * Defines the contract between the JavaScript layer and the native VWO SDK module.
 * Each method corresponds to a native bridge function exposed by the platform-specific implementation.
 */
interface VWOBridgeInterface {
  /** Initializes the native VWO SDK with the given options. */
  initialize(options: VWOInitOptions): Promise<string>;

  /** Retrieves a previously initialized SDK instance by its account ID and SDK key. */
  getInstance(accountId: number, sdkKey: string): Promise<{ success: boolean; accountId: number; sdkKey: string }>;

  /** Clears a native SDK instance identified by account ID and SDK key. */
  clearInstance(accountId: number, sdkKey: string): Promise<void>;

  /** Evaluates a feature flag for the given feature key and user context. */
  getFlag(
    featureKey: string,
    accountId: number,
    sdkKey: string,
    context: VWOUserContext
  ): Promise<GetFlagResult>;

  /** Tracks a custom event with optional event properties for the given user context. */
  trackEvent(
    eventName: string,
    accountId: number,
    sdkKey: string,
    context: VWOUserContext,
    eventProperties?: { [key: string]: any }
  ): Promise<void> | void;

  /** Sets user attributes for the given user context. */
  setAttribute(
    attributes: { [key: string]: any },
    accountId: number,
    sdkKey: string,
    context: VWOUserContext
  ): Promise<any>;

  /** Creates an alias mapping from one user context to another identifier. */
  setAlias(
    fromContext: VWOUserContext,
    toAlias: string,
    accountId: number,
    sdkKey: string
  ): Promise<void> | void;

  /** Sets session-level data for the current FME session. */
  setSessionData(data: { [key: string]: any }): void;

  /** Sends the SDK initialization time metric to the VWO analytics backend. */
  sendSdkInitTime(initTimeMs: number, accountId: number, sdkKey: string): Promise<void> | void;
}

/**
 * Initializes the VWO SDK with the provided configuration options.
 *
 * Attempts initialization with retry logic and timeout handling.
 * On success, returns a fully configured {@link VWO} instance.
 * On failure (after exhausting retries), returns a safe mock instance
 * to prevent app crashes.
 *
 * @param {VWOInitOptions} options - Configuration options including account ID, SDK key,
 *   and optional retry/timeout settings.
 * @returns {Promise<VWO>} A VWO instance (real or mock fallback) that is ready for use.
 */
export async function init(options: VWOInitOptions): Promise<any> {
  const MAX_RETRIES = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const RETRY_DELAY_MS = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const INIT_TIMEOUT_MS = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS;
  const initStartTime = Date.now();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const vwoInstance = new VWO();

      /* Attach the React Native version to vwoMeta for platform usage statistics. */
      const updatedOptions = {
        ...options,
        vwoMeta: {
          ...(options.vwoMeta || {}),
          lv: `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}`,
        },
      };

      if (!VWONative || typeof VWONative.initialize !== 'function') {
        if (attempt <= MAX_RETRIES) {
          console.log(
            `VWO SDK: Native module not available (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying...`
          );
          await new Promise((resolve) =>
            setTimeout(() => resolve(undefined), RETRY_DELAY_MS)
          );
          continue;
        } else {
          console.warn(
            'VWO SDK: SDK is not initialized - native module not available.'
          );
          return createMockVWOInstance();
        }
      }

      /* Guard against indefinite hangs by racing the init call against a timeout. */
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => {
          console.warn(
            'VWO SDK: SDK is not initialized - initialization timeout.'
          );
          resolve('timeout');
        }, INIT_TIMEOUT_MS)
      );

      /* Whichever settles first wins — successful init or the timeout sentinel. */
      const result = await Promise.race([
        VWONative.initialize(updatedOptions),
        timeoutPromise,
      ]);

      /* If the timeout sentinel won the race, retry or fall back to a mock instance. */
      if (result === 'timeout') {
        if (attempt <= MAX_RETRIES) {
          console.log(
            `VWO SDK: Initialization timeout (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying...`
          );
          await new Promise((resolve) =>
            setTimeout(() => resolve(undefined), RETRY_DELAY_MS)
          );
          continue;
        } else {
          console.warn(
            'VWO SDK: SDK is not initialized - using fallback mode.'
          );
          return createMockVWOInstance();
        }
      }

      /* Initialization succeeded — bind credentials to the instance for future API calls. */
      vwoInstance.accountId = options.accountId;
      vwoInstance.sdkKey = options.sdkKey;

      /* Cache the instance in the static map so it can be retrieved via VWO.getInstance(). */
      if (options.accountId && options.sdkKey) {
        VWO._instances.set(
          VWO._instanceKey(options.accountId, options.sdkKey),
          vwoInstance
        );
      }

      /* Record the total initialization duration and report it as an analytics metric. */
      const sdkInitTime = Date.now() - initStartTime;
      try {
        await vwoInstance.sendSdkInitTime(sdkInitTime);
      } catch (_e) {
        /* Silently ignore metric-reporting failures — they must not block SDK usage. */
      }

      return vwoInstance;
    } catch (error) {
      if (attempt <= MAX_RETRIES) {
        console.log(
          `VWO SDK: Initialization failed (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying...`
        );
        await new Promise((resolve) =>
          setTimeout(() => resolve(undefined), RETRY_DELAY_MS)
        );
        continue;
      } else {
        /* Log errors for debugging but avoid throwing to preserve app stability. */
        console.warn(
          'VWO SDK: SDK is not initialized - initialization failed.'
        );
        console.warn('VWO SDK: Using fallback mode to ensure app stability.');

        /* Return a no-op mock instance instead of null to prevent downstream crashes. */
        return createMockVWOInstance();
      }
    }
  }
}

/**
 * Creates a no-op mock VWO instance that mirrors the real {@link VWO} API surface.
 *
 * Returned when SDK initialization fails or times out so that consuming code
 * can continue to call VWO methods safely without null-checks or try/catch blocks.
 *
 * @returns A mock object whose methods return safe default values (e.g., `false`, empty arrays).
 */
function createMockVWOInstance() {
  return {
    accountId: undefined as number | undefined,
    sdkKey: undefined as string | undefined,
    getFlag: async () => ({
      isEnabled: () => false,
      getVariable: (_: string, defaultValue: any) => defaultValue,
      getVariables: () => [],
    }),
    trackEvent: async () => {},
    setAttribute: async () => {},
    setAlias: async () => {},
    setSessionData: async () => {},
    sendSdkInitTime: async () => {},
    clearInstance: async () => false,
    cleanup: () => {},
  };
}

/**
 * Primary class for interacting with the VWO Feature Management and Experimentation SDK.
 *
 * Provides methods to evaluate feature flags, track custom events, set user
 * attributes, manage aliases, and handle session data. Supports multiple
 * concurrent instances identified by unique account ID / SDK key pairs.
 *
 * Instances are created via the top-level {@link init} function and can be
 * retrieved later with {@link VWO.getInstance}.
 */
export class VWO {
  /** The VWO account ID bound to this instance. */
  accountId?: number;

  /** The SDK key bound to this instance. */
  sdkKey?: string;

  /**
   * @internal
   * Static map of active VWO instances keyed by `"${accountId}_${sdkKey}"`.
   * Used to support multiple concurrent SDK instances.
   */
  static _instances: Map<string, VWO> = new Map();

  /**
   * @internal
   * Generates a composite lookup key from an account ID and SDK key.
   *
   * @param {number} accountId - The VWO account ID.
   * @param {string} sdkKey - The SDK key.
   * @returns {string} A unique string key in the format `"accountId_sdkKey"`.
   */
  static _instanceKey(accountId: number, sdkKey: string): string {
    return `${accountId}_${sdkKey}`;
  }

  /**
   * Evaluates a feature flag for the specified feature key and user context.
   *
   * Returns an object with helper methods to check the flag's enabled state
   * and to retrieve individual or all variables associated with the flag.
   *
   * @param {string} featureKey - The unique key identifying the feature flag.
   * @param {VWOUserContext} context - The user context used for flag evaluation.
   * @returns {Promise<GetFlagResult>} The evaluated flag result with helper accessors.
   * @throws Will throw if the native bridge call fails.
   */
  getFlag = async (
    featureKey: string,
    context: VWOUserContext
  ): Promise<GetFlagResult> => {
    try {
      const flag: any = await VWONative.getFlag(
        featureKey,
        this.accountId ?? 0,
        this.sdkKey ?? '',
        context
      );

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

  /**
   * Tracks a custom event for the given user context.
   *
   * Optionally accepts a map of event properties that are forwarded to the
   * VWO analytics backend alongside the event.
   *
   * @param {string} eventName - The name of the event to track.
   * @param {VWOUserContext} context - The user context associated with the event.
   * @param {{ [key: string]: any }} [eventProperties] - Optional key-value pairs of event metadata.
   * @returns {Promise<void>} Resolves when the event has been dispatched.
   * @throws Will throw if the native bridge call fails.
   */
  trackEvent = async (
    eventName: string,
    context: VWOUserContext,
    eventProperties?: { [key: string]: any }
  ): Promise<void> => {
    try {
      const result = VWONative.trackEvent(
        eventName,
        this.accountId ?? 0,
        this.sdkKey ?? '',
        context,
        eventProperties
      );
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (error) {
      console.error('Failed to track event:', error);
      throw error;
    }
  };

  /**
   * Sets one or more user attributes for the given user context.
   *
   * Attributes are sent to VWO and can be used for audience targeting
   * and segmentation in campaigns.
   *
   * @param {{ [key: string]: any }} attributes - A map of attribute names to their values.
   * @param {VWOUserContext} context - The user context to associate the attributes with.
   * @returns {Promise<any>} Resolves when the attributes have been sent.
   * @throws Will throw if the native bridge call fails.
   */
  setAttribute = async (
    attributes: { [key: string]: any },
    context: VWOUserContext
  ): Promise<any> => {
    try {
      await VWONative.setAttribute(
        attributes,
        this.accountId ?? 0,
        this.sdkKey ?? '',
        context
      );
    } catch (error) {
      console.error('Failed to set attribute:', error);
      throw error;
    }
  };

  /**
   * Creates an alias that maps one user identity to another.
   *
   * Useful for linking an anonymous user context to a known user identifier
   * after authentication.
   *
   * @param {VWOUserContext} fromContext - The original user context to alias from.
   * @param {string} toAlias - The target alias identifier.
   * @returns {Promise<void>} Resolves when the alias has been registered.
   * @throws Will throw if the native bridge call fails.
   */
  setAlias = async (fromContext: VWOUserContext, toAlias: string): Promise<void> => {
    try {
      const result = VWONative.setAlias(
        fromContext,
        toAlias,
        this.accountId ?? 0,
        this.sdkKey ?? ''
      );
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (error) {
      console.error('Failed to set alias:', error);
      throw error;
    }
  };

  /**
   * Sets session-level data for the current FME session.
   *
   * Session data persists for the duration of the user's session and is
   * available for targeting and segmentation within VWO campaigns.
   *
   * @param {{ [key: string]: any }} data - A map of session data key-value pairs.
   */
  setSessionData = async (data: { [key: string]: any }) => {
    VWONative.setSessionData(data);
  };

  /**
   * Sends the SDK initialization time metric to the VWO analytics backend.
   *
   * This method requires a valid `accountId` and `sdkKey` to be set on the instance
   * (i.e., the instance must have been created via {@link init} or retrieved via
   * {@link VWO.getInstance}).
   *
   * @param {number} initTimeMs - The initialization duration in milliseconds.
   * @returns {Promise<void>} Resolves when the metric has been dispatched.
   * @throws {Error} If `accountId` or `sdkKey` is not set on the instance.
   */
  sendSdkInitTime = async (initTimeMs: number): Promise<void> => {
    const accountId = this.accountId ?? 0;
    const sdkKey = this.sdkKey ?? '';
    if (accountId === 0 || !sdkKey) {
      throw new Error('sendSdkInitTime requires accountId and sdkKey. Use an instance from init() or VWO.getInstance().');
    }
    const result = VWONative.sendSdkInitTime(initTimeMs, accountId, sdkKey);
    if (result && typeof result.then === 'function') {
      await result;
    }
  };

  /**
   * Registers a callback that is invoked whenever an integration event is emitted
   * from the native VWO SDK.
   *
   * @param {(properties: { [key: string]: any }) => void} callback - The handler
   *   to invoke with the integration event properties.
   * @returns {() => void} A cleanup function that removes the listener when called.
   */
  static registerIntegrationCallback(
    callback: (properties: { [key: string]: any }) => void
  ) {
    const subscription = myModuleEmitter.addListener(
      'IntegrationCallbackEvent',
      callback
    );
    return () => subscription.remove();
  }

  /**
   * Removes the global log event listener.
   * Call this during teardown to prevent memory leaks.
   */
  cleanup?: () => void = () => {
    logListener.remove();
  };

  /**
   * Registers a callback that is invoked for every log message emitted by the
   * native VWO SDK.
   *
   * @param {(log: { message: string; type: string }) => void} callback - The handler
   *   to invoke with each log entry containing the message text and severity type.
   * @returns {() => void} A cleanup function that removes the listener when called.
   */
  static registerLogCallback(
    callback: (log: { message: string; type: string }) => void
  ) {
    const logSubscription = myModuleEmitter.addListener('LogEvent', (event) => {
      const { message, type } = event;
      callback({ message, type });
    });

    return () => logSubscription.remove();
  }

  /**
   * Retrieves a previously initialized VWO instance by its account ID and SDK key.
   *
   * Looks up the instance in the internal JS-side map. The instance must have
   * been created via {@link init} beforehand.
   *
   * @param {number} accountId - The VWO account ID.
   * @param {string} sdkKey - The SDK key.
   * @returns {VWO | null} The matching VWO instance, or `null` if none is found.
   */
  static getInstance(accountId: number, sdkKey: string): VWO | null {
    try {
      const key = VWO._instanceKey(accountId, sdkKey);
      return VWO._instances.get(key) || null;
    } catch (error) {
      console.error('VWO: Error getting instance:', error);
      return null;
    }
  }

  /**
   * Clears this VWO instance from both the JavaScript-side cache and the
   * native SDK layer.
   *
   * After calling this method the instance is invalidated and should no
   * longer be used. Subsequent calls to {@link VWO.getInstance} with the
   * same credentials will return `null`.
   *
   * @returns {Promise<boolean>} `true` if the instance was successfully cleared,
   *   `false` if credentials were missing or the native bridge was unavailable.
   */
  clearInstance = async (): Promise<boolean> => {
    try {
      const accountId = this.accountId ?? 0;
      const sdkKey = this.sdkKey ?? '';
      if (accountId === 0 || !sdkKey) {
        return false;
      }
      if (typeof VWONative.clearInstance !== 'function') {
        return false;
      }
      await VWONative.clearInstance(accountId, sdkKey);
      VWO._instances.delete(VWO._instanceKey(accountId, sdkKey));
      return true;
    } catch (error) {
      console.error('Failed to clear instance:', error);
      return false;
    }
  };
}
