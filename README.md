# VWO Feature Management and Experimentation SDK for React Native

[![npm version](https://img.shields.io/npm/v/vwo-fme-react-native-sdk?style=for-the-badge&color=green&logo=npm)](https://www.npmjs.com/package/vwo-fme-react-native-sdk)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](http://www.apache.org/licenses/LICENSE-2.0)

## Overview

The **VWO Feature Management and Experimentation SDK** (VWO FME iOS SDK) enables iOS developers to integrate feature flagging and experimentation into their applications. This SDK provides full control over feature rollout, A/B testing, and event tracking, allowing teams to manage features dynamically and gain insights into user behavior.


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
To customize the SDK further, additional parameters can be passed to the `VWOInitOptions` initializer. Here’s a table describing each option:


| **Parameter**                | **Description**                                                                                                                                             | **Required** | **Type** | **Example**                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------- | ------------------------------- |
| `accountId`                  | VWO Account ID for authentication.                                                                                                                          | Yes          | number      | `123456`                        |
| `sdkKey`                     | SDK key corresponding to the specific environment to initialize the VWO SDK Client. You can get this key from VWO Application.                              | Yes          | String   | `"32-alpha-numeric-sdk-key"`    |
| `logLevel`                   | The level of logging to be used.                                                                                                                            | No           | Enum     | `LogLevel.debug`                        |
| `logPrefix`                  | A prefix to be added to log messages.                                                                                                                        | No           | String   | `"VWO"`                         |
| `pollInterval`               | Time interval for fetching updates from VWO servers (in milliseconds).                                                                                      | No           | Int64    | `60000`                         |
| `integrations`               | To use callback function to handle integration events.                                                                                                             | No           | Bool | `true` |
| `cachedSettingsExpiryTime`   | Expiry time for cached settings in milliseconds.                                                                                                            | No           | number    | `3600000`                       |
| `cachedDecisionExpiryTime`   | Expiry time for cached `getFlag` decisions in milliseconds. `0` means decisions never expire.                                                              | No           | number    | `60000`                         |
| `batchMinSize`               | Minimum size of batch to upload.                                                                                                                            | No           | number      | `10`                            |
| `batchUploadTimeInterval`    | Batch upload time interval in milliseconds.                                                                                                                 | No           | Int64    | `300000`                        |
| `maxRetries`                 | Maximum number of retry attempts for SDK initialization (default: 1).                                                                                       | No           | number      | `1`                            |
| `retryDelayMs`               | Delay between retry attempts in milliseconds (default: 2000).                                                                                               | No           | number      | `2000`                         |
| `initTimeoutMs`              | Timeout for SDK initialization in milliseconds (default: 15000).                                                                                            | No           | number      | `15000`                        |
| `isAliasingEnabled`          | Enables alias support for linking user identities via `setAlias`.                                                                                           | No           | boolean     | `true`                         |
| `shouldTriggerIntegrationCallbackAlways` | When `true`, integration callback fires on every evaluation (including cached decisions). Default fires once per unique payload.                  | No           | boolean     | `true`                         |

### Additional Callbacks

- **Integration Callback**: Use `VWO.registerIntegrationCallback` to manage integration events. Refer [documentation](https://developers.vwo.com/v2/docs/fme-react-native-integrations)

- **Log Callback**: Use `VWO.registerLogCallback` to capture and handle log events.  Refer [documentation](https://developers.vwo.com/v2/docs/fme-react-native-logging)



Refer to the [official VWO documentation](https://developers.vwo.com/v2/docs/fme-react-native-install) for additional parameter details.


### User Context

The `context` object uniquely identifies users and is crucial for consistent feature rollouts. A typical `context` includes an `id` for identifying the user. It can also include other attributes that can be used for targeting and segmentation, such as `customVariables`.

#### Parameters Table

The following table explains all the parameters in the `context` object:

| **Parameter**     | **Description**                                                            | **Required** | **Type** | **Example**                       |
| ----------------- | -------------------------------------------------------------------------- | ------------ | -------- | --------------------------------- |
| `id`              | Unique identifier for the user.                                            | Yes          | String   | `'unique_user_id'`                |
| `customVariables` | Custom attributes for targeting.                                           | No           | Object   | `{ age: 25, location: 'US' }`     |
| `shouldUseDeviceIdAsUserId` | Falls back to device ID when `id` is not provided.                         | No           | Boolean  | `true`                             |
| `bucketingSeed`   | Custom seed used for bucketing instead of `id` when provided.              | No           | String   | `'stable-seed-123'`               |
| `postSegmentationVariables` | Keys from `customVariables` applied as post-segmentation attributes. | No           | String[] | `['plan', 'country']`             |
| `ipAddress`       | User IP for gateway user-details (sent when gateway is configured). iOS.   | No           | String   | `'1.2.3.4'`                       |

#### Example

```javascript
import {  VWOUserContext } from 'vwo-fme-react-native-sdk/src/types';

const userContext: VWOUserContext = {
  id: 'unique_user_id',
  customVariables: { age: 25, location: 'US', plan: 'premium' },
  postSegmentationVariables: ['plan', 'location'],
  bucketingSeed: 'stable-seed-123',
};
```

### Custom Bucketing Seed

Use `bucketingSeed` when you need the same variation for different user IDs that share a seed (for example household or account-level consistency).

```javascript
const userContext: VWOUserContext = {
  id: 'user_a',
  bucketingSeed: 'household-123',
};
```

### Cached Decision Expiry

Use `cachedDecisionExpiryTime` so stored `getFlag` decisions expire and are re-evaluated after the configured interval.

```javascript
const options: VWOInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
  cachedDecisionExpiryTime: 60000, // 1 minute
};
vwoClient = await init(options);
```

### Always Trigger Integration Callback

When `shouldTriggerIntegrationCallbackAlways` is `true`, the integration callback runs on every evaluation, including decisions served from cache.

```javascript
const options: VWOInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
  integrations: true,
  shouldTriggerIntegrationCallbackAlways: true,
};
vwoClient = await init(options);
```

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

```javascript
const userContext: VWOUserContext = {
  shouldUseDeviceIdAsUserId: true,
  customVariables: { platform: 'ios' },
};

const flagResult = await vwoClient.getFlag('new_checkout', userContext);
```

### Multi-Instance / Multi-Account

You can initialize multiple SDK instances for different account and SDK key pairs in the same app.

```javascript
const clientA = await init({ accountId: 111111, sdkKey: 'sdk-key-a' });
const clientB = await init({ accountId: 222222, sdkKey: 'sdk-key-b' });

// retrieve an initialized instance later
const reusedClientA = VWO.getInstance(111111, 'sdk-key-a');

```

### Basic Feature Flagging

Feature Flags serve as the foundation for all testing, personalization, and rollout rules within FME.
To implement a feature flag, first use the `getFlag` API to retrieve the flag configuration.
The `getFlag` API provides a simple way to check if a feature is enabled for a specific user and access its variables. It returns a feature flag object that contains methods for checking the feature's status and retrieving any associated variables.

| Parameter    | Description                                                      | Required | Type   | Example              |
| ------------ | ---------------------------------------------------------------- | -------- | ------ | -------------------- |
| `featureKey` | Unique identifier of the feature flag                            | Yes      | String | `'new_checkout'`     |
| `context`    | Object containing user identification and contextual information | Yes      | VWOUserContext | `{ id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} }` |


Example usage:

```javascript
import {  VWOUserContext, GetFlagResult } from 'vwo-fme-react-native-sdk/src/types';

const userContext: VWOUserContext = { id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} };

// get feature flag
const flagResult: GetFlagResult = await vwoClient.getFlag('new_checkout', userContext);

// check if flag is enabled
const isEnabled = flagResult.isEnabled();

if (isEnabled) {
  console.log('Feature is enabled!');

  // get all variables of feature flag
  const allVariables = flagResult.getVariables();

  // get the variable value for the given variable key and default value
  const variableValue = flagResult.getVariable('feature_flag_variable_key', 'default_value');

} else {
  console.log('Feature is not enabled!');
}
```

### Evaluating multiple flags

`getFlags` evaluates several feature flags in one call and returns a collection you can look up by feature key. Pass `null` or `[]` to evaluate every flag from settings. Variation-shown impressions and MAU tracking are sent with the evaluation.

| Parameter | Description | Required | Type | Example |
| --- | --- | --- | --- | --- |
| `flagNames` | Feature keys to evaluate. `null` or `[]` evaluates all flags from settings. | No | `string[] \| null` | `['checkout', 'pricing']` |
| `context` | User context used for evaluation. | Yes | VWOUserContext | `{ id: 'unique_user_id' }` |

```javascript
const flags = await vwoClient.getFlags(['checkout', 'pricing'], userContext);
const checkout = flags.get('checkout');

if (checkout.isEnabled()) {
  const color = checkout.getVariable('color', 'blue');
}

flags.keys(); // feature keys that were evaluated
flags.size();
```

### Custom Event Tracking

Feature flags can be enhanced with connected metrics to track key performance indicators (KPIs) for your features. These metrics help measure the effectiveness of your testing rules by comparing control versus variation performance, and evaluate the impact of personalization and rollout campaigns. Use the `trackEvent` API to track custom events like conversions, user interactions, and other important metrics:

| Parameter         | Description                                                            | Required | Type   | Example                |
| ----------------- | ---------------------------------------------------------------------- | -------- | ------ | ---------------------- |
| `eventName`       | Name of the event you want to track                                    | Yes      | String | `'purchase_completed'` |
| `context`    | Object containing user identification and contextual information | Yes      | VWOUserContext | `{ id: 'unique_user_id' }` |
| `eventProperties` | Additional properties/metadata associated with the event               | No       | Object | `{ amount: 49.99 }`    |

Example usage:

```javascript
const userContext: VWOUserContext = { id: 'unique_user_id' };

vwoClient.trackEvent('purchase_completed', userContext, { amount: 49.99 });
```
See [Tracking Conversions](https://developers.vwo.com/v2/docs/fme-react-native-metrics#usage) documentation for more information.


### Pushing Attributes

User attributes provide rich contextual information about users, enabling powerful personalization. The `setAttribute` method provides a simple way to associate these attributes with users in VWO for advanced segmentation. Here's what you need to know about the method parameters:

| Parameter        | Description                                                            | Required | Type   | Example                        |
| ---------------- | ---------------------------------------------------------------------- | -------- | ------ | ------------------------------ |
| `attributes`     | An object containing key-value pairs of attributes to set              | Yes      | Object | `{ 'plan_type': 'premium', 'age': 30, 'isActive': true }`   |
| `context`    | Object containing user identification and contextual information | Yes      | VWOUserContext | `{ id: 'unique_user_id' }` |

Example usage:

```javascript
const userContext: VWOUserContext = { id: 'unique_user_id' };

const attributes = { plan_type: 'premium', age: 25 };
vwoClient.setAttribute(attributes, userContext);
```

See [Pushing Attributes](https://developers.vwo.com/v2/docs/fme-react-native-attributes#usage) documentation for additional information.

### Polling Interval Adjustment

The `pollInterval` is an optional parameter that allows the SDK to automatically fetch and update settings from the VWO server at specified intervals. Setting this parameter ensures your application always uses the latest configuration.

Example usage:

```javascript
const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID, pollInterval: 600000 }; // 10 minutes
vwoClient = await init(options);
```

### Cached Settings Expiry Time

The `cachedSettingsExpiryTime` parameter allows you to specify how long the cached settings should be considered valid before fetching new settings from the VWO server. This helps in managing the freshness of the configuration data.

Example usage:

```javascript
const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID, cachedSettingsExpiryTime: 600000 }; // 10 minutes
vwoClient = await init(options);
```

### Cached Decision Expiry Time

The `cachedDecisionExpiryTime` parameter controls how long a stored `getFlag` decision remains valid. After it expires, the next `getFlag` call re-evaluates the decision. Use `0` (default) for decisions that never expire.

Example usage:

```javascript
const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID, cachedDecisionExpiryTime: 60000 }; // 1 minute
vwoClient = await init(options);
```

### Event Batching Configuration

The VWO SDK supports storing impression events while the device is offline, ensuring no data loss. These events are batched and seamlessly synchronized with VWO servers once the device reconnects to the internet. Additionally, online event batching allows synchronization of impression events while the device is online. This feature can be configured by setting either the minimum batch size or the batch upload time interval during SDK initialization.

#### NOTE: The batching will trigger based on whichever condition is met first if using both options.

| **Parameter**               | **Description**                                                                                     | **Required** | **Type** | **Example** |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | -------- | ----------- |
| `batchMinSize`              | Minimum size of the batch to upload.                                                               | No           | number      | `10`        |
| `batchUploadTimeInterval`   | Batch upload time interval in milliseconds. Please specify at least a few minutes.                  | No           | number    | `300000`    |

Example usage:

```javascript
const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID, batchMinSize: 10, batchUploadTimeInterval: 300000 }; // 5 minutes
vwoClient = await init(options);
```

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
