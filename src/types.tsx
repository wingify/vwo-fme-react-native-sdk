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

// Interface for initializing SDK with configuration options
export interface VWOInitOptions {
  sdkKey?: string;
  accountId?: number;
  logLevel?: LogLevel;
  logPrefix?: string;
  integrations?: any;
  gatewayService?: { [key: string]: any };
  cachedSettingsExpiryTime?: number;
  pollInterval?: number;
  batchMinSize?: number;
  batchUploadTimeInterval?: number;
  isUsageStatsDisabled?: boolean;
  vwoMeta?: { [key: string]: any };
}
// Interface representing the context of a user
export interface VWOUserContext {
  id?: string;
  customVariables?: { [key: string]: any };
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

// Enum representing different log levels for the SDK
export enum LogLevel {
  trace = 'TRACE',
  debug = 'DEBUG',
  info = 'INFO',
  warn = 'WARN',
  error = 'ERROR',
}
