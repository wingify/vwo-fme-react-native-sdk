/**
 * Copyright 2024-2026 Wingify Software Pvt. Ltd.
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

import Foundation

/// JS client brand: from `vwo.init()` vs `wingify.init()` (runtime, not compile-time).
@objc public enum FmeClientSdkBrand: Int {
  case vwo = 0
  case wingify = 1
}

public enum FmeClientSdkBrandParser {
  /// Reads brand from the dedicated `sdkBrand` bridge argument (`"vwo"` | `"wingify"`).
  public static func parse(from value: Any?) -> FmeClientSdkBrand {
    guard let raw = value as? String else {
      return .vwo
    }
    switch raw.lowercased() {
    case "wingify":
      return .wingify
    default:
      return .vwo
    }
  }

  public static func name(for brand: FmeClientSdkBrand) -> String {
    switch brand {
    case .vwo:
      return "vwo"
    case .wingify:
      return "wingify"
    }
  }

  public static func bridgeSdkName(for brand: FmeClientSdkBrand) -> String {
    switch brand {
    case .vwo:
      return "vwo-fme-react-native-sdk"
    case .wingify:
      return "wingify-fme-react-native-sdk"
    }
  }
}
