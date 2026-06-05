/**
 * Copyright 2024-2026 Wingify Software Pvt. Ltd.
 *
 * Maps native iOS SDK types to the pod linked by the RN wrapper podspec:
 * - `vwo-fme-react-native-sdk.podspec`  -> VWO-FME  (FME_NATIVE_VWO_SDK)
 * - `wingify-fme-react-native-sdk.podspec` -> Wingify-FME (FME_NATIVE_WINGIFY_SDK)
 */

import Foundation

#if FME_NATIVE_WINGIFY_SDK
@_exported import Wingify_FME

typealias FmeNativeSdk = WingifyFme
typealias FmeInitOptions = WingifyInitOptions
typealias FmeUserContext = WingifyUserContext

#elseif FME_NATIVE_VWO_SDK
@_exported import VWO_FME

typealias FmeNativeSdk = VWOFme
typealias FmeInitOptions = VWOInitOptions
typealias FmeUserContext = VWOUserContext

#else
#error ("Define FME_NATIVE_VWO_SDK or FME_NATIVE_WINGIFY_SDK in the podspec (pod_target_xcconfig).")
#endif
