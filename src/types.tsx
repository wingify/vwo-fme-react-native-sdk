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

// Interface for initializing SDK with configuration options
export interface VWOInitOptions {
  sdkKey?: string;
  accountId?: number;
  logLevel?: LogLevel;
  logPrefix?: string;
  integrations?: any;
  gatewayService?: { [key: string]: any };
  cachedSettingsExpiryTime?: number;
  /** Expiry for cached getFlag decisions in ms; 0 = never expire. */
  cachedDecisionExpiryTime?: number;
  pollInterval?: number;
  batchMinSize?: number;
  batchUploadTimeInterval?: number;
  isUsageStatsDisabled?: boolean;
  isAliasingEnabled?: boolean; // Enable for setup userId alias
  /** When true, integration callback fires on every evaluation (including cached). Default: once per unique payload. */
  shouldTriggerIntegrationCallbackAlways?: boolean;
  vwoMeta?: { [key: string]: any };
  maxRetries?: number; // Maximum number of retry attempts (default: 1)
  retryDelayMs?: number; // Delay in milliseconds between retries (default: 2000)
  initTimeoutMs?: number; // Initialization timeout in milliseconds (default: 15000)
}
// Interface representing the context of a user
export interface VWOUserContext {
  id?: string;
  customVariables?: { [key: string]: any };
  shouldUseDeviceIdAsUserId?: boolean;
  /** When set, used for bucketing instead of user id. */
  bucketingSeed?: string;
  /** Keys from customVariables applied as post-segmentation attributes. */
  postSegmentationVariables?: string[];
  /** User IP for gateway user-details (sent when gateway is configured). */
  ipAddress?: string;
}

// Interface representing a variable used in feature flags
export interface Variable {
  key: string;
  value: any;
  type: string;
  id: number;
}

// Interface representing the result of a feature flag
export interface GetFlag {
  isEnabled: boolean;
  variables: Variable[];
}

// Interface representing the result of a feature flag operation
export interface GetFlagResult {
  isEnabled: any;
  getVariable: any;
  getVariables: any;
}

/**
 * Collection of evaluated flags keyed by feature key.
 * A missing key resolves to a disabled flag.
 */
export interface FlagCollectionResult {
  get: (featureKey: string) => GetFlagResult;
  keys: () => string[];
  size: () => number;
}

// Enum representing different log levels for the SDK
export enum LogLevel {
  trace = 'TRACE',
  debug = 'DEBUG',
  info = 'INFO',
  warn = 'WARN',
  error = 'ERROR',
}
