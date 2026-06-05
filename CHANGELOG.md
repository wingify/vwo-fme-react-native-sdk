# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.50.0] - 2026-06-05

This release introduces Wingify as the primary SDK branding for React Native, while keeping existing VWO integrations fully supported.

Both React Native entry points ship from the **same codebase**. New releases publish as **`wingify-fme-react-native-sdk`**; the legacy npm name **`vwo-fme-react-native-sdk`** remains documented for existing consumers.

| Install / import | Public API |
| --- | --- |
| `wingify-fme-react-native-sdk/wingify` (or `vwo-fme-react-native-sdk/wingify`) | `Wingify`, `WingifyInitOptions`, `WingifyUserContext` (recommended) |
| `wingify-fme-react-native-sdk` or `vwo-fme-react-native-sdk` (root) | `VWO`, `VWOInitOptions`, `VWOUserContext` (legacy, deprecated) |

For migration notes, see [MIGRATION_GUIDE_WINGIFY_REACT_NATIVE.md](./MIGRATION_GUIDE_WINGIFY_REACT_NATIVE.md).

### Added

- **Wingify public API** — use `Wingify`, `WingifyInitOptions`, and `WingifyUserContext` for new integrations.
- **Wingify entry point** — `vwo-fme-react-native-sdk/wingify` as a dedicated import path for Wingify-branded usage.

```ts
// Wingify (recommended)
import {
  init as initWingify,
  type WingifyInitOptions,
  type WingifyUserContext,
} from 'vwo-fme-react-native-sdk/wingify';

const options: WingifyInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
};

const wingifyClient = await initWingify(options);

const context: WingifyUserContext = { id: 'user-123' };
const flag = await wingifyClient.getFlag('feature-key', context);
```

### Changed

- SDK initialization now supports Wingify-branded APIs via `initWingify(...)` and `Wingify` client type.
- Documentation and logs have been updated to reflect Wingify branding where applicable.
- When initialized through Wingify APIs, settings/events route through Wingify hosts (`edge.wingify.net`, `collect.wingify.net`).
- React Native SDK version is aligned with native SDKs (`1.50.0`) and upgraded native dependencies.
- No breaking changes for existing VWO integrations — event names, payload keys, and runtime behavior remain compatible.

### Deprecated

The following VWO APIs remain supported but are deprecated:

| Deprecated (still supported) | Use instead |
| --- | --- |
| `VWO` | `Wingify` |
| `VWOInitOptions` | `WingifyInitOptions` |
| `VWOUserContext` | `WingifyUserContext` |
| (none for metadata) | Init metadata field remains `vwoMeta` on both VWO and Wingify init options |

Existing code does not need to change immediately. We recommend using Wingify APIs for new projects and migrating when convenient:

```ts
// Still supported — no action required today
import { init, VWO, type VWOInitOptions, type VWOUserContext } from 'vwo-fme-react-native-sdk';

const options: VWOInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
};

const vwoClient: VWO = await init(options);

const context: VWOUserContext = { id: 'user-123' };
await vwoClient.getFlag('feature-key', context);
```

**Migration tip:** Replace `VWO` → `Wingify`, `VWOInitOptions` → `WingifyInitOptions`, `VWOUserContext` → `WingifyUserContext`, install `wingify-fme-react-native-sdk` and import from `wingify-fme-react-native-sdk/wingify` (legacy package name + `/wingify` still work). Keep `vwoMeta` in init options. Method signatures and SDK behavior remain compatible.

## [1.9.0] - 2026-04-29

### Added

- Multi-instance / multi-account for different credentials within a single application.
- Introduced holdout group support for feature flags and events, including holdout settings in the configuration, SDK-side holdout evaluation, and exclusion of users in holdout groups from feature rollouts and experiments.
- Support to advance debugging.
- Support to use Device ID if `context.id` is not available.
- Support to set user Aliasing.

## [1.8.2] - 2025-12-17

### Fixed

- Fixed a bug validating settings when json type variable contains array of objects
- Fixed issue where `getVariable()` and `getVariables()` returned fallback/empty values when fetching user data from storage for rollout rule.

## [1.8.1] - 2025-10-29

### Added

- Added retry mechanism for SDK initialization with configurable retry attempts and delay.

### Fixed

- Fixed misleading crash logs when SDK `init` is invoked before the React Native bridge loads.


## [1.8.0] - 2025-09-22

### Added

- Added support for sending a one-time SDK initialization event to VWO server as part of health-check milestones.
- Update UserAgent to support Device Type.
- Added unit tests for better code stability.

### Fixed

- Handling crashes when `VWO.init` is called multiple times

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
