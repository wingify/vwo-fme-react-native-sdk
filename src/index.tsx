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

/**
 * Public entry for existing VWO integrations.
 * New projects may import from:
 * - `wingify-fme-react-native-sdk/wingify` (new package name), or
 * - `vwo-fme-react-native-sdk/wingify` (legacy package name),
 * or use Wingify exports below.
 */

export { init, VWO } from './vwo';

export type {
  VWOInitOptions,
  VWOUserContext,
  GetFlagResult,
  GetFlag,
  Variable,
} from './types';

export { LogLevel } from './types';

export {
  Wingify,
  init as initWingify,
  type WingifyInitOptions,
  type WingifyUserContext,
} from './wingify';
