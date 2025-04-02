# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-04-02

### Added

- Added log callback handler that forwards log data to external systems.

### Fixed

- Fixed return value of variable API in case of JSON-type variable and having nested objects.

## [1.5.0] - 2025-03-12

### Added

- Added support to use DACDN as a substitute for the Gateway Service.


## [1.4.0] - 2025-03-11

### Added

- Added support for storing impression events while the device is offline, ensuring no data loss. These events are batched and seamlessly synchronized with VWO servers once the device reconnects to the internet.
- Online event batching, allowing synchronization of impression events while the device is online. This feature can be configured by setting either the minimum batch size or the batch upload time interval during SDK initialization.
- Support for sending multiple attributes at once.

  ```javascript
  const attributes = { attr1: value1, attr2: value2 };
  vwoClient.setAttribute(attributes, userContext);
  ```

- Support for configuring SDK when linking with VWO Mobile Insights SDK. This can be configured by setting session data received via callback from Mobile Insights SDK

  ```javascript
  const options: VWOInitOptions = { sdkKey: SDK_KEY, accountId: ACCOUNT_ID };
  vwoClient = await init(options);
  vwoClient.setSessionData(sessionInfo); // sessionInfo is received from Mobile Insights SDK via a callback function
  ```

## [1.0.0] - 2024-12-23

### Added

- First release of VWO Feature Management and Experimentation capabilities
