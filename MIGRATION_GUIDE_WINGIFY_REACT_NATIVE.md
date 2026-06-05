# Migration Guide: VWO -> Wingify (React Native SDK)

As part of our branding exercise, we changed developer-facing SDK names from **VWO** to **Wingify** while keeping feature-flag functionality and behavior compatible.

## What changed (high level)

- **npm package name (new releases):** `wingify-fme-react-native-sdk`
- **Legacy npm package name (still supported in docs/code paths):** `vwo-fme-react-native-sdk`
- Wingify-branded API ships from the same codebase; install either package name depending on your release track.
- New Wingify entry path (works with **both** package names):
  - `wingify-fme-react-native-sdk/wingify` (recommended)
  - `vwo-fme-react-native-sdk/wingify` (legacy package name)
- Existing VWO root entry (legacy package only until you migrate imports):
  - `vwo-fme-react-native-sdk` or `wingify-fme-react-native-sdk` (root export)
- Primary API naming for new integrations:
  - `VWO` -> `Wingify`
  - `VWOInitOptions` -> `WingifyInitOptions`
  - `VWOUserContext` -> `WingifyUserContext`
- Native implementation files are renamed to `FmeReactNativeSdk*` internally.
- iOS podspecs: `vwo-fme-react-native-sdk.podspec` or `wingify-fme-react-native-sdk.podspec` (selected from `package.json` `name` at autolink time).

## Pointers: what is impacted

| Area | What changed | Customer impact | What to do |
| --- | --- | --- | --- |
| npm package name | `vwo-fme-react-native-sdk` -> `wingify-fme-react-native-sdk` for new publishes | Existing apps using old package name must change `package.json` dependency or keep old package | New apps: `yarn add wingify-fme-react-native-sdk` |
| JS import path | Root + `/wingify` subpath on either package name | Old imports keep working only if you still install the legacy package name | Update imports to `wingify-fme-react-native-sdk/wingify` when migrating |
| SDK type/class | `VWO` -> `Wingify` | Compile/type updates for migrated code | Replace type/class name in app code |
| Init/context types | `VWOInitOptions` -> `WingifyInitOptions`, `VWOUserContext` -> `WingifyUserContext` | Type mismatch if partially migrated | Rename all related types together |
| Init metadata key | Still `vwoMeta` | No change needed | Keep using `vwoMeta` |
| iOS pod name | `fme-react-native-sdk` | Podfile updates may be needed if manually pinned | Run `pod install`; update manual pod entries if any |
| Deprecated VWO API | VWO-branded APIs remain available | Possible deprecation warnings over time | Migrate gradually to Wingify names |

## npm package: old vs new

| | Legacy | New (recommended) |
| --- | --- | --- |
| Install | `yarn add vwo-fme-react-native-sdk` | `yarn add wingify-fme-react-native-sdk` |
| Wingify entry | `from 'vwo-fme-react-native-sdk/wingify'` | `from 'wingify-fme-react-native-sdk/wingify'` |
| VWO entry (deprecated) | `from 'vwo-fme-react-native-sdk'` | `from 'wingify-fme-react-native-sdk'` (root; same API) |

**Important:** Changing the npm package name does **not** change import paths automatically in your app. After `yarn add wingify-fme-react-native-sdk`, update every import from `vwo-fme-react-native-sdk` to `wingify-fme-react-native-sdk` (and prefer `/wingify` for Wingify APIs).

Native linking is unchanged: the bridge module remains `NativeModules.VwoFmeReactNativeSdk` (with fallback).

**iOS CocoaPods pod name (matches npm package):**

| npm package | Podspec file | CocoaPods pod `s.name` |
| --- | --- | --- |
| `vwo-fme-react-native-sdk` | `vwo-fme-react-native-sdk.podspec` | `vwo-fme-react-native-sdk` |
| `wingify-fme-react-native-sdk` | `wingify-fme-react-native-sdk.podspec` | `wingify-fme-react-native-sdk` |

`react-native.config.js` reads `package.json` `name` and picks the matching podspec automatically.

## Release workflow (maintainers)

Both podspec files are included in the npm tarball (`"files": ["*.podspec", ...]`). Use the matching `package.json` before publish:

**VWO npm release (`vwo-fme-react-native-sdk`):**

```bash
# package.json must have: "name": "vwo-fme-react-native-sdk"
npm run prepare
npm publish
```

**Wingify npm release (`wingify-fme-react-native-sdk`):**

```bash
cp package.wingify.json package.json
npm run prepare
npm publish
```

After publish, consumers run `pod install` in their app; autolinking installs the pod whose name matches the installed npm package.

**iOS native dependency (per npm package):**

| npm package | CocoaPods native pod | Swift module |
| --- | --- | --- |
| `vwo-fme-react-native-sdk` | `VWO-FME` | `VWO_FME` |
| `wingify-fme-react-native-sdk` | `Wingify-FME` | `Wingify_FME` |

The RN bridge compiles with `FME_NATIVE_VWO_SDK` or `FME_NATIVE_WINGIFY_SDK` (set in each wrapper podspec). Do **not** install both native pods in one app — duplicate symbols.

JS still uses `initializeVwo` / `initializeWingify` for branding; both call the native SDK linked by that npm package.

### iOS troubleshooting: duplicate symbols / `Wingify_FME` import errors

1. Remove manual `pod 'VWO-FME'` from the app Podfile if present (keep only autolinked `vwo-fme-react-native-sdk` or `wingify-fme-react-native-sdk`).
2. Clean install:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock build ~/Library/Developer/Xcode/DerivedData/*
   pod install
   ```
3. Rebuild the app (not only Metro refresh).

## What needs to be done at customer's end

1. **New projects** — install the Wingify package:
   - `yarn add wingify-fme-react-native-sdk`
2. **Existing projects** — either stay on `vwo-fme-react-native-sdk` (no immediate change) or migrate dependency + imports to `wingify-fme-react-native-sdk`.
3. Update imports to Wingify entry point when ready:
   - `from 'vwo-fme-react-native-sdk'` -> `from 'wingify-fme-react-native-sdk/wingify'`
   - (or keep legacy package: `from 'vwo-fme-react-native-sdk/wingify'`)
3. Update API names:
   - `VWO` -> `Wingify`
   - `VWOInitOptions` -> `WingifyInitOptions`
   - `VWOUserContext` -> `WingifyUserContext`
4. Keep metadata key unchanged:
   - continue using `vwoMeta`
5. iOS only:
   - run `cd ios && pod install`
   - if Podfile has manual entry for old pod name, update it to `fme-react-native-sdk` or use autolinking.

## Sample code (before/after)

### Before (VWO)

```ts
import { init, VWO, type VWOInitOptions, type VWOUserContext } from 'vwo-fme-react-native-sdk';

const options: VWOInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
};

const vwoClient: VWO = await init(options);

const userContext: VWOUserContext = {
  id: 'unique_user_id',
  customVariables: { key_1: 2 },
};

const flag = await vwoClient.getFlag('feature_flag_name', userContext);
console.log('Flag enabled:', flag.isEnabled());
```

### After (Wingify)

```ts
import {
  init as initWingify,
  Wingify,
  type WingifyInitOptions,
  type WingifyUserContext,
} from 'wingify-fme-react-native-sdk/wingify';

const options: WingifyInitOptions = {
  sdkKey: SDK_KEY,
  accountId: ACCOUNT_ID,
  // metadata key is still vwoMeta
  vwoMeta: { appVersion: '1.0.0' },
};

const wingifyClient: Wingify = await initWingify(options);

const userContext: WingifyUserContext = {
  id: 'unique_user_id',
  customVariables: { key_1: 2 },
};

const flag = await wingifyClient.getFlag('feature_flag_name', userContext);
console.log('Flag enabled:', flag.isEnabled());
```

## Compatibility and rollout strategy

- Existing VWO integrations do not need immediate code changes.
- New projects should start with Wingify imports and names.
- For active apps, migrate file-by-file:
  1. imports
  2. types
  3. client class references
  4. smoke test getFlag/trackEvent/setAttribute flows

## Validation checklist after migration

- App builds successfully on iOS and Android
- SDK initializes with expected account and sdkKey
- `getFlag` returns expected enablement/variables
- `trackEvent` is received in campaign metrics
- `setAttribute` and `setAlias` work as expected
- iOS pods resolve with `fme-react-native-sdk`
