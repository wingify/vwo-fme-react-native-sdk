# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2025-09-01

### Added
- Added support for sending a one-time SDK initialization event to VWO server as part of health-check milestones.
- Update UserAgent to support Device Type.
- Added unit tests for better code stability.

### Changed

- Updated SDK's usage data upload logic to aggregate in single account

## [1.7.3] - 2025-07-25

### Added

- Upgraded native Android dependency to v1.6.4 and IOS dependency to v1.8.2 . This update added the SDK name and version in the events and batching call to VWO as query parameters.

## [1.7.2] - 2025-07-24

### Added

- Upgraded native Android dependency to v1.6.3 and IOS dependency to v1.8.1 . This update added the SDK name and version in the settings call to VWO as query parameters.

## [1.7.1] - 2025-06-24

### Added

- Upgraded native Android dependency to v1.6.2. This update reduces the app's footprint through dependency minimization.

## [1.7.0] - 2025-05-09

### Added

- Enhanced tracking and collection of usage statistics for SDK features and configurations, providing valuable insights for analytics.

### Changed

- Renamed VWOContext to VWOUserContext for improved clarity and consistency across other SDKs.

## [1.6.1] - 2025-05-05

### Fixed

- Fixed NoSuchKeyException crash in the Android bridge by checking for the optional integrations key before accessing it during SDK initialization.

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
