require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

# CocoaPods pod for npm package `vwo-fme-react-native-sdk`.
# Autolinking selects this file when package.json `name` is vwo-fme-react-native-sdk.
# Native sources: FmeReactNativeSdk.*; bridge module: VwoFmeReactNativeSdk.
Pod::Spec.new do |s|
  s.name         = "vwo-fme-react-native-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/wingify/vwo-fme-react-native-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "VWO-FME", "1.55.0"

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"

    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
          "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
          "SWIFT_ACTIVE_COMPILATION_CONDITIONS" => "$(inherited) FME_NATIVE_VWO_SDK"
      }
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end

  existing_xcconfig = s.attributes_hash["pod_target_xcconfig"] || {}
  s.pod_target_xcconfig = existing_xcconfig.merge(
    "SWIFT_ACTIVE_COMPILATION_CONDITIONS" => "$(inherited) FME_NATIVE_VWO_SDK"
  )
end
