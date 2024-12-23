# VWO FME React Native SDK

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

## Installation

```bash
yarn add vwo-fme-react-native-sdk
```

For iOS, install the CocoaPods dependencies by running below command. Supports iOS version 12.0 and above.

`cd ios && pod install`

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
      console.error('Error initialising', error);
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
vwoClient.setAttribute('attribute_name', 'attribute_value', userContext);
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

Copyright 2024 Wingify Software Pvt. Ltd.
