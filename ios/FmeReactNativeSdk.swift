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

import React
import Foundation

/// RN bridge module. Native pod is VWO-FME or Wingify-FME depending on wrapper podspec (see FmeNativeTypes.swift).
@objc(VwoFmeReactNativeSdk)
class FmeReactNativeSdk: RCTEventEmitter, IntegrationCallback, LogTransport {

  private var clientBrandsByInstanceKey: [String: FmeClientSdkBrand] = [:]

  private struct InitParams {
    let sdkKey: String
    let accountId: Int
    let logLevel: LogLevelEnum
    let logPrefix: String
    let hasIntegrations: Bool
    let gatewayService: [String: Any]
    let cachedSettingsExpiry: Int64?
    let pollInterval: Int64?
    let batchMinSize: Int?
    let batchUploadTimeInterval: Int64?
    let initMeta: [String: Any]
    let isUsageStatsDisabled: Bool
    let isAliasingEnabled: Bool
    let sdkName: String
    let sdkVersion: String
  }

  private func instanceKey(accountId: Int, sdkKey: String) -> String {
    "\(accountId)_\(sdkKey)"
  }

  func clientSdkBrand(accountId: Int, sdkKey: String) -> FmeClientSdkBrand {
    clientBrandsByInstanceKey[instanceKey(accountId: accountId, sdkKey: sdkKey)] ?? .vwo
  }

  private func storeClientBrand(accountId: Int, sdkKey: String, brand: FmeClientSdkBrand) {
    clientBrandsByInstanceKey[instanceKey(accountId: accountId, sdkKey: sdkKey)] = brand
  }

  func log(logType: String, message: String) {
    sendEvent(withName: "LogEvent", body: ["message": message, "type": logType])
  }

  private var integrationCallback: RCTResponseSenderBlock?

  func execute(_ properties: [String : Any]) {
    sendEvent(withName: "IntegrationCallbackEvent", body: properties)
  }

  override func supportedEvents() -> [String]! {
    return ["IntegrationCallbackEvent", "LogEvent"]
  }

  @objc(registerIntegrationCallback:)
  func registerIntegrationCallback(callback: @escaping RCTResponseSenderBlock) {
    self.integrationCallback = callback
  }

  func executeIntegrationCallback(properties: [String: Any]) {
    integrationCallback?([properties])
  }

  private func parseInitMetadata(from options: NSDictionary) -> [String: Any] {
    options["vwoMeta"] as? [String: Any] ?? [:]
  }

  private func parseLogLevel(from options: NSDictionary, clientBrand: FmeClientSdkBrand) -> LogLevelEnum {
    guard let logLevelString = options["logLevel"] as? String else {
      return .error
    }

    let normalized = logLevelString.lowercased()
    if let level = LogLevelEnum(rawValue: normalized) {
      return level
    }

    let label = FmeClientSdkBrandParser.name(for: clientBrand).uppercased()
    print("\(label) React Native SDK: Invalid logLevel '\(logLevelString)'. Defaulting to error.")
    return .error
  }

  private func parseInitParams(from options: NSDictionary, clientBrand: FmeClientSdkBrand) -> InitParams? {
    guard let sdkKey = options["sdkKey"] as? String, !sdkKey.isEmpty else { return nil }
    guard let accountId = options["accountId"] as? Int else { return nil }

    let logLevel = parseLogLevel(from: options, clientBrand: clientBrand)

    var cachedSettingsExpiry: Int64? = nil
    if let expiry = options["cachedSettingsExpiryTime"] as? Int64 {
      cachedSettingsExpiry = expiry
    }

    var pollInterval: Int64? = nil
    if let interval = options["pollInterval"] as? Int64 {
      pollInterval = interval
    }

    var batchMinSize: Int? = nil
    if let minSize = options["batchMinSize"] as? Int {
      batchMinSize = minSize
    }

    var batchUploadTimeInterval: Int64? = nil
    if let timeInterval = options["batchUploadTimeInterval"] as? Int64 {
      batchUploadTimeInterval = timeInterval
    }

    let gatewayService = options["gatewayService"] as? [String: Any] ?? [:]
    let initMeta = parseInitMetadata(from: options)
    let isUsageStatsDisabled = options["isUsageStatsDisabled"] as? Bool ?? false
    let logPrefix = options["logPrefix"] as? String ?? ""
    let isAliasingEnabled = options["isAliasingEnabled"] as? Bool ?? false
    let hasIntegrations = options["integrations"] != nil

    return InitParams(
      sdkKey: sdkKey,
      accountId: accountId,
      logLevel: logLevel,
      logPrefix: logPrefix,
      hasIntegrations: hasIntegrations,
      gatewayService: gatewayService,
      cachedSettingsExpiry: cachedSettingsExpiry,
      pollInterval: pollInterval,
      batchMinSize: batchMinSize,
      batchUploadTimeInterval: batchUploadTimeInterval,
      initMeta: initMeta,
      isUsageStatsDisabled: isUsageStatsDisabled,
      isAliasingEnabled: isAliasingEnabled,
      sdkName: FmeClientSdkBrandParser.bridgeSdkName(for: clientBrand),
      sdkVersion: "1.55.0"
    )
  }

  @objc
  func initializeVwo(
    _ options: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    initialize(options, clientBrand: .vwo, resolver: resolver, rejecter: rejecter)
  }

  @objc
  func initializeWingify(
    _ options: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    initialize(options, clientBrand: .wingify, resolver: resolver, rejecter: rejecter)
  }

  @objc
  func initialize(
    _ options: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    initialize(options, clientBrand: .vwo, resolver: resolver, rejecter: rejecter)
  }

  private func initialize(
    _ options: NSDictionary,
    clientBrand: FmeClientSdkBrand,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    guard let params = parseInitParams(from: options, clientBrand: clientBrand) else {
      if (options["sdkKey"] as? String)?.isEmpty != false {
        rejecter("MISSING_SDK_KEY", "SDK Key is missing", nil)
      } else {
        rejecter("MISSING_ACCOUNT_ID", "Account ID is missing", nil)
      }
      return
    }

    storeClientBrand(accountId: params.accountId, sdkKey: params.sdkKey, brand: clientBrand)

    let initOptions = FmeInitOptions(
      sdkKey: params.sdkKey,
      accountId: params.accountId,
      logLevel: params.logLevel,
      logPrefix: params.logPrefix,
      integrations: params.hasIntegrations ? self : nil,
      gatewayService: params.gatewayService,
      cachedSettingsExpiryTime: params.cachedSettingsExpiry,
      pollInterval: params.pollInterval,
      batchMinSize: params.batchMinSize,
      batchUploadTimeInterval: params.batchUploadTimeInterval,
      sdkName: params.sdkName,
      sdkVersion: params.sdkVersion,
      logTransport: self,
      isUsageStatsDisabled: params.isUsageStatsDisabled,
      vwoMeta: params.initMeta,
      isAliasingEnabled: params.isAliasingEnabled
    )

    FmeNativeSdk.initialize(options: initOptions) { result in
      switch result {
      case .success(let message):
        resolver(message)
      case .failure(let error):
        rejecter("E_INITIALIZATION_FAILED", error.localizedDescription, nil)
      }
    }
  }

  @objc
  func getClientSdkBrand(
    _ accountId: NSNumber,
    sdkKey: String,
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    if sdkKey.isEmpty {
      rejecter("INVALID_ARGS", "sdkKey is required", nil)
      return
    }
    resolver(FmeClientSdkBrandParser.name(for: clientSdkBrand(accountId: accountId.intValue, sdkKey: sdkKey)))
  }

  @objc
  func sendSdkInitTime(_ initTimeMs: NSNumber, accountId: NSNumber, sdkKey: String) {
    let accountIdValue = accountId.intValue
    guard accountIdValue != 0, !sdkKey.isEmpty else { return }

    if let instance = FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKey) {
      instance.sendSdkInitEvent(sdkInitTime: initTimeMs.int64Value)
    }
  }

  @objc
  func getInstance(_ accountId: NSNumber, sdkKey: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let accountIdValue = accountId.intValue

    guard FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKey) != nil else {
      rejecter("INSTANCE_NOT_FOUND", "FME instance not found for accountId: \(accountId) and sdkKey: \(sdkKey)", nil)
      return
    }

    let brand = clientSdkBrand(accountId: accountIdValue, sdkKey: sdkKey)
    resolver([
      "success": true,
      "accountId": accountId,
      "sdkKey": sdkKey,
      "clientSdkBrand": FmeClientSdkBrandParser.name(for: brand),
    ])
  }

  @objc
  func clearInstance(
    _ accountId: NSNumber,
    sdkKey: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let accountIdValue = accountId.intValue
    guard accountIdValue != 0, !sdkKey.isEmpty else {
      rejecter("INVALID_ARGS", "clearInstance requires accountId and sdkKey.", nil)
      return
    }

    FmeNativeSdk.clearInstance(accountId: accountIdValue, sdkKey: sdkKey)
    clientBrandsByInstanceKey.removeValue(
      forKey: instanceKey(accountId: accountIdValue, sdkKey: sdkKey)
    )

    resolver([
      "success": true,
      "accountId": accountId,
      "sdkKey": sdkKey,
    ])
  }

  private func userContext(from context: NSDictionary) -> FmeUserContext {
    FmeUserContext(
      id: context["id"] as? String,
      shouldUseDeviceIdAsUserId: context["shouldUseDeviceIdAsUserId"] as? Bool ?? false,
      customVariables: context["customVariables"] as? [String: Any] ?? [:]
    )
  }

  @objc
  func getFlag(_ featureKey: String, accountId: NSNumber, sdkKey: String, context: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let accountIdValue = accountId.intValue
    let sdkKeyValue = sdkKey

    if accountIdValue != 0 && !sdkKeyValue.isEmpty,
       let instance = FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
      instance.getFlag(featureKey: featureKey, context: userContext(from: context)) { flag in
        resolver(["isEnabled": flag.isEnabled(), "variables": flag.getVariables()])
      }
      return
    }

    FmeNativeSdk.getFlag(featureKey: featureKey, context: userContext(from: context)) { flag in
      resolver(["isEnabled": flag.isEnabled(), "variables": flag.getVariables()])
    }
  }

  @objc
  func trackEvent(_ eventName: String, accountId: NSNumber, sdkKey: String, context: NSDictionary, eventProperties: NSDictionary) {
    let accountIdValue = accountId.intValue
    let sdkKeyValue = sdkKey
    let props = eventProperties as? [String: Any]
    let ctx = userContext(from: context)

    if accountIdValue != 0 && !sdkKeyValue.isEmpty,
       let instance = FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
      instance.trackEvent(eventName: eventName, context: ctx, eventProperties: props)
      return
    }

    FmeNativeSdk.trackEvent(eventName: eventName, context: ctx, eventProperties: props)
  }

  @objc
  func setAttribute(_ attributes: NSDictionary, accountId: NSNumber, sdkKey: String, context: NSDictionary) {
    let accountIdValue = accountId.intValue
    let sdkKeyValue = sdkKey
    let attrs = attributes as? [String: Any] ?? [:]
    let ctx = userContext(from: context)

    if accountIdValue != 0 && !sdkKeyValue.isEmpty,
       let instance = FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
      instance.setAttribute(attributes: attrs, context: ctx)
      return
    }

    FmeNativeSdk.setAttribute(attributes: attrs, context: ctx)
  }

  @objc
  func setAlias(_ fromContext: NSDictionary, toAlias: String, accountId: NSNumber, sdkKey: String) {
    let accountIdValue = accountId.intValue
    let sdkKeyValue = sdkKey
    let from = userContext(from: fromContext)

    if accountIdValue != 0 && !sdkKeyValue.isEmpty,
       let instance = FmeNativeSdk.getInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
      instance.setAlias(from: from, to: toAlias)
      return
    }

    FmeNativeSdk.setAlias(from: from, to: toAlias)
  }

  @objc
  func setSessionData(_ data: NSDictionary) {
    let sessionData = data as? [String: Any] ?? [:]
    #if FME_NATIVE_WINGIFY_SDK
    FmeConfig.setSessionData(sessionData)
    #elseif FME_NATIVE_VWO_SDK
    FMEConfig.setSessionData(sessionData)
    #endif
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
