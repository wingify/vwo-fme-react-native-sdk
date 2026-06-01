/**
 * Copyright 2024-2025 Wingify Software Pvt. Ltd.
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

import VWO_FME
import React
import Foundation

// Define a class that extends RCTEventEmitter and conforms to IntegrationCallback protocol
@objc(VwoFmeReactNativeSdk)
class VwoFmeReactNativeSdk: RCTEventEmitter, IntegrationCallback, LogTransport {

    // Sends a log message and its type as a "LogEvent" to JavaScript for display in the console.
    func log(logType: String, message: String) {
        sendEvent(withName: "LogEvent", body: ["message": message,
                                                "type": logType])
    }

      // A callback to handle integration responses
      private var integrationCallback: RCTResponseSenderBlock?

    // Method to execute integration callback and send event to JavaScript
    func execute(_ properties: [String : Any]) {
        sendEvent(withName: "IntegrationCallbackEvent", body: properties)
    }

    // Define the supported events that can be emitted to JavaScript
    override func supportedEvents() -> [String]! {
        return ["IntegrationCallbackEvent", "LogEvent"]
    }

    // Register a callback for integration events
    @objc(registerIntegrationCallback:)
    func registerIntegrationCallback(callback: @escaping RCTResponseSenderBlock) {
        self.integrationCallback = callback
    }

  // Execute the registered integration callback with given properties
    func executeIntegrationCallback(properties: [String: Any]) {
      integrationCallback?([properties])
    }

  // Initialize the SDK with provided options
  @objc
  func initialize(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let sdkKey = options["sdkKey"] as? String, !sdkKey.isEmpty else {
      rejecter("MISSING_SDK_KEY", "SDK Key is missing", nil)
      return
    }

    guard let accountId = options["accountId"] as? Int else {
      rejecter("MISSING_ACCOUNT_ID", "Account ID is missing", nil)
      return
    }

      let hasIntegrations = options["integrations"] != nil

      let logLevel: LogLevelEnum
      if let logLevelString = options["logLevel"] as? String {
          // LogLevelEnum expects lowercase values: "trace", "debug", "info", "warn", "error"
          let normalizedLogLevel = logLevelString.lowercased()
          if let level = LogLevelEnum(rawValue: normalizedLogLevel) {
              logLevel = level
          } else {
              // Invalid log level provided, default to .error and log warning
              print("VWO React Native SDK: Invalid logLevel '\(logLevelString)'. Valid values are: trace, debug, info, warn, error. Defaulting to error.")
              logLevel = .error
          }
      } else {
          // No log level provided, default to .error
          logLevel = .error
      }

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

      var gatewayService: [String: Any] = [:]
      if let gateway = options["gatewayService"] as? [String: Any] {
          gatewayService = gateway
      }

      var vwoMeta: [String: Any] = [:]
      if let vwoMetaData = options["vwoMeta"] as? [String: Any] {
          vwoMeta = vwoMetaData
      }

      var isUsageStatsDisabled: Bool = false
      if let usageStatsValue = options["isUsageStatsDisabled"] as? Bool {
          isUsageStatsDisabled = usageStatsValue
      }

      var logPrefix: String = ""
      if let prefix = options["logPrefix"] as? String {
          logPrefix = prefix
      }

      var isAliasingEnabled: Bool = false
      if let aliasingEnabled = options["isAliasingEnabled"] as? Bool {
          isAliasingEnabled = aliasingEnabled
      }

      var sdkName: String = "vwo-fme-react-native-sdk"
      var sdkVersion: String = "1.9.0"

      let vwoOptions: VWOInitOptions
      vwoOptions = VWOInitOptions(sdkKey: sdkKey,
                                  accountId: accountId,
                                  logLevel: logLevel,
                                  logPrefix: logPrefix,
                                  integrations: hasIntegrations ? self : nil,
                                  gatewayService: gatewayService,
                                  cachedSettingsExpiryTime: cachedSettingsExpiry,
                                  pollInterval: pollInterval,
                                  batchMinSize: batchMinSize,
                                  batchUploadTimeInterval: batchUploadTimeInterval,
                                  sdkName: sdkName,
                                  sdkVersion: sdkVersion,
                                  logTransport: self,
                                  isUsageStatsDisabled: isUsageStatsDisabled,
                                  vwoMeta: vwoMeta,
                                  isAliasingEnabled: isAliasingEnabled)

    VWOFme.initialize(options: vwoOptions) { result in
      switch result {
      case .success(let message):

        resolver(message)
      case .failure(let error):
        rejecter("E_INITIALIZATION_FAILED", error.localizedDescription, nil)
      }
    }
  }

  // Send SDK initialization time to native SDK for a specific instance
  @objc
  func sendSdkInitTime(_ initTimeMs: NSNumber, accountId: NSNumber, sdkKey: String) {
    // Note: The native SDK already handles sending SDK init events internally during initialization.
    // This method is kept for backward compatibility but may not work correctly with multiple instances
    // as it requires access to the VWOClient's ServiceContainer which is not publicly accessible.
    // For proper multi-instance support, the SDK init event is automatically sent during initialization.
    // Use sentinel values: accountId = 0 or sdkKey = "" means not provided
    let accountIdValue = accountId.intValue
    let sdkKeyValue = sdkKey
    
    if accountIdValue != 0 && !sdkKeyValue.isEmpty {
      // Try to get the instance and send the event if possible
      if let instance = getVWOInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
        // Requires VWOFme to expose an instance method for account-specific context.
        instance.sendSdkInitEvent(sdkInitTime: initTimeMs.int64Value)
        return
      }
    }
  }

  // Helper method to get VWO instance based on accountId and sdkKey
  private func getVWOInstance(accountId: Int?, sdkKey: String?) -> VWOFme? {
    guard let accountId = accountId, let sdkKey = sdkKey, !sdkKey.isEmpty else {
      return nil
    }
    return VWOFme.getInstance(accountId: accountId, sdkKey: sdkKey)
  }

  // Get a specific VWO instance by accountId and sdkKey
  @objc
  func getInstance(_ accountId: NSNumber, sdkKey: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let vwoInstance = getVWOInstance(accountId: accountId.intValue, sdkKey: sdkKey) else {
      rejecter("INSTANCE_NOT_FOUND", "VWO instance not found for accountId: \(accountId) and sdkKey: \(sdkKey)", nil)
      return
    }
    resolver(["success": true, "accountId": accountId, "sdkKey": sdkKey])
  }

  // Retrieve a feature flag with the given context for a specific instance
  @objc
  func getFlag(_ featureKey: String, accountId: NSNumber, sdkKey: String, context: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
  let vwoUserContext = VWOUserContext(id: context["id"] as? String, shouldUseDeviceIdAsUserId: context["shouldUseDeviceIdAsUserId"] as? Bool ?? false, customVariables: context["customVariables"] as? [String: Any] ?? [:]) 
      // Use sentinel values: accountId = 0 or sdkKey = "" means not provided (fallback to static method)
      let accountIdValue = accountId.intValue
      let sdkKeyValue = sdkKey
      
      // First, try to get instance if accountId and sdkKey are provided (non-zero accountId and non-empty sdkKey)
      if accountIdValue != 0 && !sdkKeyValue.isEmpty,
         let vwoInstance = getVWOInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
        // Use instance method if instance exists
        vwoInstance.getFlag(featureKey: featureKey, context: vwoUserContext) { flag in
          let flagResult: [String: Any] = [
              "isEnabled": flag.isEnabled(),
              "variables": flag.getVariables(),
          ]
          resolver(flagResult)
        }
        return
      }
      
      // Fallback to static method (old version) if instance not found or accountId/sdkKey not provided
      VWOFme.getFlag(featureKey: featureKey, context: vwoUserContext) { flag in
        let flagResult: [String: Any] = [
            "isEnabled": flag.isEnabled(),
            "variables": flag.getVariables(),
        ]
        resolver(flagResult)
      }
  }

  // Track an event with the given context and properties for a specific instance
  @objc
  func trackEvent(_ eventName: String, accountId: NSNumber, sdkKey: String, context: NSDictionary, eventProperties: NSDictionary) {
      let vwoUserContext = VWOUserContext(id: context["id"] as? String, shouldUseDeviceIdAsUserId: context["shouldUseDeviceIdAsUserId"] as? Bool ?? false, customVariables: context["customVariables"] as? [String: Any] ?? [:])
      
      // Use sentinel values: accountId = 0 or sdkKey = "" means not provided (fallback to static method)
      let accountIdValue = accountId.intValue
      let sdkKeyValue = sdkKey
      
      // First, try to get instance if accountId and sdkKey are provided (non-zero accountId and non-empty sdkKey)
      if accountIdValue != 0 && !sdkKeyValue.isEmpty,
         let vwoInstance = getVWOInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
        // Use instance method if instance exists
        vwoInstance.trackEvent(eventName: eventName, context: vwoUserContext, eventProperties: eventProperties as? [String: Any])
        return
      }
      
      // Fallback to static method (old version) if instance not found or accountId/sdkKey not provided
      VWOFme.trackEvent(eventName: eventName, context: vwoUserContext, eventProperties: eventProperties as? [String: Any])
  }

  // Set an attribute for the given context for a specific instance
  @objc
  func setAttribute(_ attributes: NSDictionary, accountId: NSNumber, sdkKey: String, context: NSDictionary) {
      let vwoUserContext = VWOUserContext(id: context["id"] as? String, shouldUseDeviceIdAsUserId: context["shouldUseDeviceIdAsUserId"] as? Bool ?? false, customVariables: context["customVariables"] as? [String: Any] ?? [:])
      
      // Use sentinel values: accountId = 0 or sdkKey = "" means not provided (fallback to static method)
      let accountIdValue = accountId.intValue
      let sdkKeyValue = sdkKey
      
      // First, try to get instance if accountId and sdkKey are provided (non-zero accountId and non-empty sdkKey)
      if accountIdValue != 0 && !sdkKeyValue.isEmpty,
         let vwoInstance = getVWOInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
        // Use instance method if instance exists
        vwoInstance.setAttribute(attributes: attributes as? [String: Any] ?? [:], context: vwoUserContext)
        return
      }
      
      // Fallback to static method (old version) if instance not found or accountId/sdkKey not provided
      VWOFme.setAttribute(attributes: attributes as? [String: Any] ?? [:], context: vwoUserContext)
  }

  // Set alias for a user for a specific instance
  @objc
  func setAlias(_ fromContext: NSDictionary, toAlias: String, accountId: NSNumber, sdkKey: String) {
      let vwoUserContext = VWOUserContext(id: fromContext["id"] as? String, shouldUseDeviceIdAsUserId: fromContext["shouldUseDeviceIdAsUserId"] as? Bool ?? false, customVariables: fromContext["customVariables"] as? [String: Any] ?? [:])
      
      // Use sentinel values: accountId = 0 or sdkKey = "" means not provided (fallback to static method)
      let accountIdValue = accountId.intValue
      let sdkKeyValue = sdkKey
      
      // First, try to get instance if accountId and sdkKey are provided (non-zero accountId and non-empty sdkKey)
      if accountIdValue != 0 && !sdkKeyValue.isEmpty,
         let vwoInstance = getVWOInstance(accountId: accountIdValue, sdkKey: sdkKeyValue) {
        // Use instance method if instance exists
        vwoInstance.setAlias(from: vwoUserContext, to: toAlias)
        return
      }
      
      // Fallback to static method (old version) if instance not found or accountId/sdkKey not provided
      VWOFme.setAlias(from: vwoUserContext, to: toAlias)
  }

  // Sets the session data for the current FME session.
  @objc
  func setSessionData(_ data: NSDictionary) {
      FmeConfig.setSessionData(data as? [String: Any] ?? [:])
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

extension Date {
    func currentTimeMillis() -> Int64 {
        return Int64((self.timeIntervalSince1970) * 1000)
    }
}
