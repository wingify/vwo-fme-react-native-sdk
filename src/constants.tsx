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

// Default retry configuration values
export const DEFAULT_MAX_RETRIES = 1; // 2 total attempts (initial + 1 retry)
export const DEFAULT_RETRY_DELAY_MS = 2000; // 2 seconds delay between retries
export const DEFAULT_INIT_TIMEOUT_MS = 15000; // 15 seconds timeout for initialization
