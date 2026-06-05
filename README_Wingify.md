# Wingify Feature Management and Experimentation SDK for React Native

This file is the Wingify-specific guide.

## Install

**New package name (recommended for release):**

```bash
yarn add wingify-fme-react-native-sdk
# or
npm install wingify-fme-react-native-sdk
```

**Legacy package name (still supported):**

```bash
yarn add vwo-fme-react-native-sdk
```

See [MIGRATION_GUIDE_WINGIFY_REACT_NATIVE.md](./MIGRATION_GUIDE_WINGIFY_REACT_NATIVE.md) for full migration steps.

## Wingify Usage (Recommended)

```ts
import {
  init as initWingify,
  Wingify,
  type WingifyInitOptions,
  type WingifyUserContext,
} from 'wingify-fme-react-native-sdk/wingify';
// Legacy package name also works:
// from 'vwo-fme-react-native-sdk/wingify';

const options: WingifyInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
  // Metadata key remains vwoMeta
  vwoMeta: { appVersion: '1.0.0' },
};

const wingifyClient = await initWingify(options);
const userContext: WingifyUserContext = { id: 'user-123' };
const flag = await wingifyClient.getFlag('new_checkout', userContext);
```

## Old and Deprecated (Still Supported)

The following VWO APIs are old/deprecated but still supported for backward compatibility:

| Deprecated (old) | Use instead |
| --- | --- |
| `VWO` | `Wingify` |
| `VWOInitOptions` | `WingifyInitOptions` |
| `VWOUserContext` | `WingifyUserContext` |

### Old Import (still works)

```ts
// Legacy npm package + VWO API
import { init, VWO, type VWOInitOptions, type VWOUserContext } from 'vwo-fme-react-native-sdk';
```

### New Import (recommended)

```ts
// New npm package + Wingify API
import { init as initWingify, Wingify } from 'wingify-fme-react-native-sdk/wingify';
```

### npm package name

| | Legacy | New |
| --- | --- | --- |
| Install | `vwo-fme-react-native-sdk` | `wingify-fme-react-native-sdk` |
| Wingify entry | `.../wingify` on either package | prefer `wingify-fme-react-native-sdk/wingify` |

## Migration Notes

- Replace `VWO` with `Wingify`
- Replace `VWOInitOptions` with `WingifyInitOptions`
- Replace `VWOUserContext` with `WingifyUserContext`
- Update npm dependency: `vwo-fme-react-native-sdk` -> `wingify-fme-react-native-sdk` (when publishing/consuming new releases)
- Move imports to `wingify-fme-react-native-sdk/wingify` (or `vwo-fme-react-native-sdk/wingify` on legacy package)
- Keep using `vwoMeta` for init metadata

Method signatures remain compatible between old and new APIs.

## Installation

```bash
# via yarn
yarn add vwo-fme-react-native-sdk

# via npm
npm install vwo-fme-react-native-sdk
```

For iOS, install the CocoaPods dependencies by running below command. Supports iOS version 12.0 and above.

```bash
cd ios && pod install
```

## Official Documentation

For more detailed documentation, please refer [here](https://developers.vwo.com/v2/docs/fme-react-native-install).

## Basic Usage

```javascript
import { init } from 'vwo-fme-react-native-sdk';

import {
  VWOInitOptions,
  VWOUserContext,
  GetFlagResult,
} from 'vwo-fme-react-native-sdk/src/types';

let vwoClient;

// initialize sdk
useEffect(() => {
  const initializeSDK = async () => {
    const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID };
    try {
      vwoClient = await init(options);
      // console.log('VWO init success');
    } catch (error) {
      // console.error('Error initialising', error);
    }
  };

  initializeSDK();
}, []);

// create user context
const userContext: VWOUserContext = { id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} };

// get feature flag
const flagResult: GetFlagResult = await vwoClient.getFlag('feature_key', userContext);

// check if flag is enabled
const isEnabled = flagResult.isEnabled();

// get the variable value for the given variable key and default value
const variableValue = flagResult.getVariable('feature_flag_variable_key', 'default_value');

// track event for the given event name with event properties
const eventProperties = { 'amount': 99 };
vwoClient.trackEvent('vwo_event_name', userContext, eventProperties);

// send attributes data
const attributes = { attr1: value1, attr2: value2 };
vwoClient.setAttribute(attributes, userContext);
```

## Advanced Configuration Options

To customize the SDK further, additional parameters can be passed to the `VWOInitOptions` initializer.

| **Parameter**                | **Description**                                                                                                                                             | **Required** | **Type** | **Example**                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------- | ------------------------------- |
| `accountId`                  | VWO Account ID for authentication.                                                                                                                          | Yes          | number   | `123456`                        |
| `sdkKey`                     | SDK key corresponding to the specific environment to initialize the VWO SDK Client. You can get this key from VWO Application.                           | Yes          | String   | `"32-alpha-numeric-sdk-key"`    |
| `logLevel`                   | The level of logging to be used.                                                                                                                            | No           | Enum     | `LogLevel.debug`                |
| `logPrefix`                  | A prefix to be added to log messages.                                                                                                                       | No           | String   | `"VWO"`                         |
| `pollInterval`               | Time interval for fetching updates from VWO servers (in milliseconds).                                                                                      | No           | Int64    | `60000`                         |
| `integrations`               | To use callback function to handle integration events.                                                                                                      | No           | Bool     | `true`                          |
| `cachedSettingsExpiryTime`   | Expiry time for cached settings in milliseconds.                                                                                                            | No           | number   | `3600000`                       |
| `batchMinSize`               | Minimum size of batch to upload.                                                                                                                            | No           | number   | `10`                            |
| `batchUploadTimeInterval`    | Batch upload time interval in milliseconds.                                                                                                                 | No           | Int64    | `300000`                        |
| `maxRetries`                 | Maximum number of retry attempts for SDK initialization (default: 1).                                                                                       | No           | number   | `1`                             |
| `retryDelayMs`               | Delay between retry attempts in milliseconds (default: 2000).                                                                                               | No           | number   | `2000`                          |
| `initTimeoutMs`              | Timeout for SDK initialization in milliseconds (default: 15000).                                                                                            | No           | number   | `15000`                         |
| `isAliasingEnabled`          | Enables alias support for linking user identities via `setAlias`.                                                                                           | No           | boolean  | `true`                          |

### Additional Callbacks

- **Integration Callback**: Use `VWO.registerIntegrationCallback` to manage integration events. Refer [documentation](https://developers.vwo.com/v2/docs/fme-react-native-integrations)
- **Log Callback**: Use `VWO.registerLogCallback` to capture and handle log events. Refer [documentation](https://developers.vwo.com/v2/docs/fme-react-native-logging)

### User Context

| **Parameter**                | **Description**                                                            | **Required** | **Type** | **Example**                   |
| ---------------------------- | -------------------------------------------------------------------------- | ------------ | -------- | ----------------------------- |
| `id`                         | Unique identifier for the user.                                            | Yes          | String   | `'unique_user_id'`            |
| `customVariables`            | Custom attributes for targeting.                                           | No           | Object   | `{ age: 25, location: 'US' }` |
| `shouldUseDeviceIdAsUserId`  | Falls back to device ID when `id` is not provided.                         | No           | Boolean  | `true`                        |

### User Aliasing

Use aliasing to connect an anonymous/pre-login user to a known identifier after sign-in.

```javascript
const options: VWOInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
  isAliasingEnabled: true,
};
const vwoClient = await init(options);

const anonymousContext: VWOUserContext = { id: 'guest_user_123' };
await vwoClient.setAlias(anonymousContext, 'logged_in_user_456');
```

### Device ID Fallback

If your app does not have a stable user ID at evaluation time, set `shouldUseDeviceIdAsUserId: true` in user context.

### Multi-Instance / Multi-Account

```javascript
const clientA = await init({ accountId: 111111, sdkKey: 'sdk-key-a' });
const clientB = await init({ accountId: 222222, sdkKey: 'sdk-key-b' });
const reusedClientA = VWO.getInstance(111111, 'sdk-key-a');
```

### Basic Feature Flagging

Use `getFlag` to evaluate a feature for a user and access its variables.

### Custom Event Tracking

Use `trackEvent` to track conversions and custom metrics.

### Pushing Attributes

Use `setAttribute` to send user attributes for segmentation.

### Polling Interval Adjustment

Use `pollInterval` in init options to auto-refresh settings.

### Cached Settings Expiry Time

Use `cachedSettingsExpiryTime` to control settings cache freshness.

### Event Batching Configuration

Use `batchMinSize` and/or `batchUploadTimeInterval` for batching behavior.

## Authors

* [Vishwajeet Singh](https://github.com/vishwajeet-wingify)

## Changelog

Refer [CHANGELOG.md](https://github.com/wingify/vwo-fme-react-native-sdk/blob/master/CHANGELOG.md)

## Contributing

Please go through our [contributing guidelines](https://github.com/wingify/vwo-fme-react-native-sdk/blob/master/CONTRIBUTING.md)

## Code of Conduct

[Code of Conduct](https://github.com/wingify/vwo-fme-react-native-sdk/blob/master/CODE_OF_CONDUCT.md)

## License

[Apache License, Version 2.0](https://github.com/wingify/vwo-fme-react-native-sdk/blob/master/LICENSE)

Copyright 2024-2026 Wingify Software Pvt. Ltd.
