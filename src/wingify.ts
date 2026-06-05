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

import { init as fmeInit, VWO } from './core/fme-client';
import { CLIENT_SDK_BRAND_WINGIFY } from './core/sdk-brand';
import type {
  VWOInitOptions,
  VWOUserContext,
  GetFlagResult,
  GetFlag,
  Variable,
} from './types';
import { LogLevel } from './types';

/** @alias VWOInitOptions — uses `vwoMeta` for init metadata. */
export type WingifyInitOptions = VWOInitOptions;

/** @alias VWOUserContext */
export type WingifyUserContext = VWOUserContext;

/**
 * Wingify Feature Management and Experimentation client.
 * Same implementation as {@link VWO}; use this type for new integrations.
 */
export class Wingify extends VWO {
  static getInstance = VWO.getInstance;
  static registerIntegrationCallback = VWO.registerIntegrationCallback;
  static registerLogCallback = VWO.registerLogCallback;
}

/**
 * Initializes via the Wingify JS entry point (`sdkBrand: 'wingify'`).
 * Init metadata must be passed as `vwoMeta` (same as the VWO entry).
 */
export async function init(options: WingifyInitOptions): Promise<Wingify> {
  const instance = await fmeInit(options, CLIENT_SDK_BRAND_WINGIFY);
  const client = new Wingify();
  client.accountId = instance.accountId;
  client.sdkKey = instance.sdkKey;
  client.clientSdkBrand = CLIENT_SDK_BRAND_WINGIFY;

  if (client.accountId && client.sdkKey) {
    Wingify._instances.set(
      Wingify._instanceKey(client.accountId, client.sdkKey),
      client
    );
  }

  return client;
}

export type { GetFlagResult, GetFlag, Variable };
export { LogLevel };
