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
      if let logLevelString = options["logLevel"] as? String,
         let level = LogLevelEnum(rawValue: logLevelString.uppercased()) {
          logLevel = level
      } else {
          // Default to .error if log level is not provided or invalid
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

      var sdkName: String = "vwo-fme-react-native-sdk"
      var sdkVersion: String = "1.5.0"

      let vwoOptions: VWOInitOptions
      if hasIntegrations {
          vwoOptions = VWOInitOptions(sdkKey: sdkKey,
                                      accountId: accountId,
                                      logLevel: logLevel,
                                      integrations: self,
                                      gatewayService: gatewayService,
                                      cachedSettingsExpiryTime: cachedSettingsExpiry,
                                      pollInterval: pollInterval,
                                      batchMinSize: batchMinSize,
                                      batchUploadTimeInterval: batchUploadTimeInterval,
                                      sdkName: sdkName,
                                      sdkVersion: sdkVersion,
                                      logTransport: self)
      } else {
          vwoOptions = VWOInitOptions(sdkKey: sdkKey,
                                      accountId: accountId,
                                      logLevel: logLevel,
                                      gatewayService: gatewayService,
                                      cachedSettingsExpiryTime: cachedSettingsExpiry,
                                      pollInterval: pollInterval,
                                      batchMinSize: batchMinSize,
                                      batchUploadTimeInterval: batchUploadTimeInterval,
                                      sdkName: sdkName,
                                      sdkVersion: sdkVersion,
                                      logTransport: self)

      }

    VWOFme.initialize(options: vwoOptions) { result in
      switch result {
      case .success(let message):
        resolver(message)
      case .failure(let error):
        rejecter("E_INITIALIZATION_FAILED", error.localizedDescription, nil)
      }
    }
  }

  // Retrieve a feature flag with the given context
  @objc
  func getFlag(_ featureKey: String, context: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
      let vwoContext = VWOContext(id: context["id"] as? String, customVariables: context["customVariables"] as? [String: Any] ?? [:])

      VWOFme.getFlag(featureKey: featureKey, context: vwoContext) { flag in

        let flagResult: [String: Any] = [
            "isEnabled": flag.isEnabled(),
            "variables": flag.getVariables(),
        ]
        resolver(flagResult)
    }
  }

  // Track an event with the given context and properties
  @objc
  func trackEvent(_ eventName: String, context: NSDictionary, eventProperties: NSDictionary) {
      let vwoContext = VWOContext(id: context["id"] as? String, customVariables: context["customVariables"] as? [String: Any] ?? [:])
      VWOFme.trackEvent(eventName: eventName, context: vwoContext, eventProperties: eventProperties as? [String: Any])
  }

  // Set an attribute for the given context
  @objc
  func setAttribute(_ attributes: NSDictionary, context: NSDictionary) {
      let vwoContext = VWOContext(id: context["id"] as? String, customVariables: context["customVariables"] as? [String: Any] ?? [:])
      VWOFme.setAttribute(attributes: attributes as? [String: Any] ?? [:], context: vwoContext)
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
