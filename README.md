# VWO Feature Management and Experimentation SDK for React Native

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

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
  VWOContext,
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
const userContext: VWOContext = { id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} };

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
| `batchMinSize`               | Minimum size of batch to upload.                                                                                                                            | No           | number      | `10`                            |
| `batchUploadTimeInterval`    | Batch upload time interval in milliseconds.                                                                                                                 | No           | Int64    | `300000`                        |

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

#### Example

```javascript
import {  VWOContext } from 'vwo-fme-react-native-sdk/src/types';

const userContext: VWOContext = { id: 'unique_user_id', customVariables: { age: 25, location: 'US' } };
```

### Basic Feature Flagging

Feature Flags serve as the foundation for all testing, personalization, and rollout rules within FME.
To implement a feature flag, first use the `getFlag` API to retrieve the flag configuration.
The `getFlag` API provides a simple way to check if a feature is enabled for a specific user and access its variables. It returns a feature flag object that contains methods for checking the feature's status and retrieving any associated variables.

| Parameter    | Description                                                      | Required | Type   | Example              |
| ------------ | ---------------------------------------------------------------- | -------- | ------ | -------------------- |
| `featureKey` | Unique identifier of the feature flag                            | Yes      | String | `'new_checkout'`     |
| `context`    | Object containing user identification and contextual information | Yes      | VWOContext | `{ id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} }` |


Example usage:

```javascript
import {  VWOContext, GetFlagResult } from 'vwo-fme-react-native-sdk/src/types';

const userContext: VWOContext = { id: 'unique_user_id', customVariables: {key_1: 0, key_2: 1} };

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

### Custom Event Tracking

Feature flags can be enhanced with connected metrics to track key performance indicators (KPIs) for your features. These metrics help measure the effectiveness of your testing rules by comparing control versus variation performance, and evaluate the impact of personalization and rollout campaigns. Use the `trackEvent` API to track custom events like conversions, user interactions, and other important metrics:

| Parameter         | Description                                                            | Required | Type   | Example                |
| ----------------- | ---------------------------------------------------------------------- | -------- | ------ | ---------------------- |
| `eventName`       | Name of the event you want to track                                    | Yes      | String | `'purchase_completed'` |
| `context`    | Object containing user identification and contextual information | Yes      | VWOContext | `{ id: 'unique_user_id' }` |
| `eventProperties` | Additional properties/metadata associated with the event               | No       | Object | `{ amount: 49.99 }`    |

Example usage:

```javascript
const userContext: VWOContext = { id: 'unique_user_id' };

vwoClient.trackEvent('purchase_completed', userContext, { amount: 49.99 });
```
See [Tracking Conversions](https://developers.vwo.com/v2/docs/fme-react-native-metrics#usage) documentation for more information.


### Pushing Attributes

User attributes provide rich contextual information about users, enabling powerful personalization. The `setAttribute` method provides a simple way to associate these attributes with users in VWO for advanced segmentation. Here's what you need to know about the method parameters:

| Parameter        | Description                                                            | Required | Type   | Example                        |
| ---------------- | ---------------------------------------------------------------------- | -------- | ------ | ------------------------------ |
| `attributes`     | An object containing key-value pairs of attributes to set              | Yes      | Object | `{ 'plan_type': 'premium', 'age': 30, 'isActive': true }`   |
| `context`    | Object containing user identification and contextual information | Yes      | VWOContext | `{ id: 'unique_user_id' }` |

Example usage:

```javascript
const userContext: VWOContext = { id: 'unique_user_id' };

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

Copyright 2024-2025 Wingify Software Pvt. Ltd.
