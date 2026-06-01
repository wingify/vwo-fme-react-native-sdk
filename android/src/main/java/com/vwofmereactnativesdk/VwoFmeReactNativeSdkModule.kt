/**
 * Copyright 2024-2025 Wingify Software Pvt. Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.vwofmereactnativesdk

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.*
import com.vwo.VWO
import com.vwo.models.user.VWOUserContext
import com.vwo.models.user.VWOInitOptions
import com.vwo.interfaces.IVwoInitCallback
import com.vwo.interfaces.IVwoListener
import com.vwo.interfaces.integration.IntegrationCallback
import com.vwo.models.user.GetFlag
import com.vwo.models.user.GatewayService
import com.vwo.models.Variable
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.vwo.interfaces.logger.LogTransport
import com.vwo.packages.logger.enums.LogLevelEnum
import com.vwo.models.user.FMEConfig
import java.lang.System

/**
 * React Native native module that serves as the Android bridge for the VWO FME SDK.
 *
 * This module exposes VWO Feature Management and Experimentation (FME) SDK functionality
 * to the JavaScript layer via React Native's bridge. It supports multi-instance management,
 * allowing multiple VWO SDK instances identified by unique `accountId` and `sdkKey` pairs.
 *
 * Key capabilities include:
 * - SDK initialization with configurable options (polling, caching, batching, logging, etc.)
 * - Feature flag evaluation via [getFlag]
 * - Event tracking via [trackEvent]
 * - User attribute management via [setAttribute]
 * - User aliasing via [setAlias]
 * - Session data management via [setSessionData]
 * - SDK initialization timing via [sendSdkInitTime]
 *
 * @param reactContext The [ReactApplicationContext] provided by the React Native framework,
 *   used for accessing Android application context and emitting events to JavaScript.
 *
 * @see VWO
 * @see VWOInitOptions
 */
class VwoFmeReactNativeSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  /**
   * Returns the name of this native module as registered with the React Native bridge.
   *
   * This name is used on the JavaScript side to reference this module
   * via `NativeModules.VwoFmeReactNativeSdk`.
   *
   * @return The constant module name [NAME].
   */
  override fun getName(): String {
    return NAME
  }

  /**
   * Initializes the VWO FME SDK with the provided configuration options.
   *
   * This method configures and launches a new VWO SDK instance using the settings
   * supplied from the JavaScript layer. It supports a wide range of initialization
   * parameters including gateway services, polling intervals, caching, event batching,
   * logging configuration, and integration callbacks.
   *
   * The initialization is asynchronous. On success, the [promise] is resolved with
   * a success message. On failure, it is rejected with a `VWO_INIT_FAILED` error code.
   *
   * @param options A [ReadableMap] containing the SDK initialization configuration. Expected keys:
   *   - `sdkKey` (String): The unique SDK key for the VWO environment.
   *   - `accountId` (Int): The VWO account identifier.
   *   - `gatewayService` (Map, optional): Gateway service configuration.
   *   - `integrations` (Boolean, optional): Whether to enable integration callbacks.
   *   - `vwoMeta` (Map, optional): Additional VWO metadata.
   *   - `isUsageStatsDisabled` (Boolean, optional): Flag to disable usage statistics collection.
   *   - `pollInterval` (Int, optional): Interval in milliseconds for polling settings updates.
   *   - `cachedSettingsExpiryTime` (Int, optional): Expiry time in seconds for cached settings.
   *   - `batchMinSize` (Int, optional): Minimum batch size before flushing events.
   *   - `batchUploadTimeInterval` (Double, optional): Time interval in milliseconds between batch uploads.
   *   - `logLevel` (String, optional): Logging level (e.g., "debug", "info", "error"). Defaults to "error".
   *   - `logPrefix` (String, optional): Prefix string for log messages.
   *   - `isAliasingEnabled` (Boolean, optional): Whether user aliasing is enabled.
   * @param promise A [Promise] that resolves with a success message on successful initialization,
   *   or rejects with error code `VWO_INIT_FAILED` and an error message on failure.
   */
  @ReactMethod
  fun initialize(options: ReadableMap, promise: Promise) {

    val sdkKey = options.getString("sdkKey") ?: ""
    val accountId = options.getInt("accountId") ?: 0

    val gatewayService = options.getMap("gatewayService")?.toHashMap() ?: HashMap<String, Any>()

    val hasIntegrations = if (options.hasKey("integrations") && !options.isNull("integrations")) {
      options.getBoolean("integrations")
    } else {
      false
    }

    val vwoMetaData = options.getMap("vwoMeta")?.toHashMap() ?: HashMap<String, Any>()

    val isUsageStatsDisabled =
      if (options.hasKey("isUsageStatsDisabled") && !options.isNull("isUsageStatsDisabled")) {
        options.getBoolean("isUsageStatsDisabled")
      } else {
        false
      }

    val pollInterval =
      if (options.hasKey("pollInterval") && !options.isNull("pollInterval")) {
        options.getInt("pollInterval")
      } else {
        null
      }

    val cachedSettingsExpiryTime =
      if (options.hasKey("cachedSettingsExpiryTime") && !options.isNull("cachedSettingsExpiryTime")) {
        options.getInt("cachedSettingsExpiryTime")
      } else {
        0
      }

    val batchMinSize =
      if (options.hasKey("batchMinSize") && !options.isNull("batchMinSize")) {
        options.getInt("batchMinSize")
      } else {
        -1
      }

    val batchUploadTimeInterval =
      if (options.hasKey("batchUploadTimeInterval") && !options.isNull("batchUploadTimeInterval")) {
        options.getDouble("batchUploadTimeInterval").toLong()
      } else {
        -1L
      }

    val logger2: MutableList<Map<String, Any>> = mutableListOf()
    val transport: MutableMap<String, Any> = mutableMapOf()
    transport["defaultTransport"] = object : LogTransport {
      override fun log(level: LogLevelEnum, message: String?) {
        if (message == null) return
        val logParams = Arguments.createMap()
        logParams.putString("message", message)
        logParams.putString("type", level.name)
        sendEvent("LogEvent", logParams)
      }
    }
    logger2.add(transport)

    val loggerValue = options.getString("logLevel")
    val normalizedLogLevel = if (loggerValue != null) {
      loggerValue.lowercase()
    } else {
      "ERROR"
    }

    val logPrefix = options.getString("logPrefix") ?: ""

    val isAliasingEnabled =
      if (options.hasKey("isAliasingEnabled") && !options.isNull("isAliasingEnabled")) {
        options.getBoolean("isAliasingEnabled")
      } else {
        false
      }

    val logger = mutableMapOf<String, Any>().apply {
      put("level", normalizedLogLevel)
      put("prefix", logPrefix)
      put("transports", logger2)
    }

    val sdkName = "vwo-fme-react-native-sdk"
    val sdkVersion = "1.9.0"

    val vwoOptions = VWOInitOptions().apply {
      this.sdkKey = sdkKey
      this.accountId = accountId
      this.context = reactApplicationContext
      this.pollInterval = pollInterval
      this.cachedSettingsExpiryTime = cachedSettingsExpiryTime
      this.gatewayService = gatewayService as Map<String, Any>
      this.logger = logger
      this.sdkName = sdkName
      this.sdkVersion = sdkVersion
      this.batchMinSize = batchMinSize
      this.batchUploadTimeInterval = batchUploadTimeInterval
      this.isUsageStatsDisabled = isUsageStatsDisabled
      this._vwo_meta = vwoMetaData
      this.isAliasingEnabled = isAliasingEnabled
      if (hasIntegrations) {
        this.integrations = object : IntegrationCallback {
          override fun execute(properties: Map<String, Any>) {
            val params = Arguments.createMap()
            for ((key, value) in properties) {
              when (value) {
                is String -> params.putString(key, value)
                is Int -> params.putInt(key, value)
                is Double -> params.putDouble(key, value)
                is Boolean -> params.putBoolean(key, value)
                is Map<*, *> -> params.putMap(key, mapToWritableMap(value))
                is List<*> -> params.putArray(key, listToWritableArray(value))
                else -> params.putString(key, value.toString())
              }
            }
            sendEvent("IntegrationCallbackEvent", params)
          }
        }
      }
    }
    VWO.init(vwoOptions, object : IVwoInitCallback {
      override fun vwoInitSuccess(vwo: VWO, message: String) {
        promise.resolve(message)
      }

      override fun vwoInitFailed(message: String) {
        promise.reject("VWO_INIT_FAILED", message)
      }
    })
  }

  /**
   * Retrieves an existing VWO SDK instance identified by the given credentials.
   *
   * This is a private helper used internally by other methods to look up
   * a previously initialized VWO instance. If no matching instance exists
   * or the native SDK throws an exception, `null` is returned.
   *
   * @param accountId The VWO account identifier associated with the desired instance.
   * @param sdkKey The SDK key associated with the desired instance.
   * @return The matching [VWO] instance, or `null` if no instance is found.
   */
  private fun getVWOInstance(accountId: Int, sdkKey: String): VWO? {
    return try {
      VWO.getInstance(accountId, sdkKey)
    } catch (e: Exception) {
      null
    }
  }

  /**
   * Retrieves a VWO SDK instance reference and returns it to the JavaScript layer.
   *
   * If a matching instance is found for the provided [accountId] and [sdkKey],
   * the [promise] is resolved with a map containing `success`, `accountId`, and `sdkKey`.
   * Otherwise, the promise is rejected with an `INSTANCE_NOT_FOUND` error.
   *
   * @param accountId The VWO account identifier for the desired instance.
   * @param sdkKey The SDK key for the desired instance.
   * @param promise A [Promise] resolved with instance metadata on success,
   *   or rejected with `INSTANCE_NOT_FOUND` if no matching instance exists.
   */
  @ReactMethod
  fun getInstance(accountId: Int, sdkKey: String, promise: Promise) {
    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance != null) {
      val result = Arguments.createMap()
      result.putBoolean("success", true)
      result.putInt("accountId", accountId)
      result.putString("sdkKey", sdkKey)
      promise.resolve(result)
    } else {
      promise.reject(
        "INSTANCE_NOT_FOUND",
        "VWO instance not found for accountId: $accountId and sdkKey: $sdkKey"
      )
    }
  }

  /**
   * Returns a human-readable error message indicating that the VWO instance
   * could not be retrieved.
   *
   * Used as a consistent error message across methods that require a valid VWO instance.
   *
   * @return A descriptive error message string.
   */
  private fun requireInstanceError(): String =
    "Could not get VWO instance, please ensure VWO is initialized properly."

  /**
   * Clears (destroys) a specific VWO SDK instance identified by [accountId] and [sdkKey].
   *
   * After this call, the instance is no longer available and must be re-initialized
   * before further use. The [promise] resolves with `null` on success, or rejects
   * with `INVALID_ARGS` if the credentials are missing, or `CLEAR_INSTANCE_FAILED`
   * if an exception occurs during cleanup.
   *
   * @param accountId The VWO account identifier of the instance to clear.
   * @param sdkKey The SDK key of the instance to clear.
   * @param promise A [Promise] resolved with `null` on success, or rejected on failure.
   */
  @ReactMethod
  fun clearInstance(accountId: Int, sdkKey: String, promise: Promise) {
    if (accountId == 0 || sdkKey.isEmpty()) {
      promise.reject("INVALID_ARGS", "clearInstance requires accountId and sdkKey.")
      return
    }
    try {
      VWO.clearInstance(accountId, sdkKey)
      val result = Arguments.createMap()
      result.putBoolean("success", true)
      result.putInt("accountId", accountId)
      result.putString("sdkKey", sdkKey)
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("CLEAR_INSTANCE_FAILED", e.message ?: "Failed to clear VWO instance.")
    }
  }

  /**
   * Evaluates a feature flag for the given user context and returns the result.
   *
   * Looks up the VWO instance by [accountId] and [sdkKey], builds a [VWOUserContext]
   * from the provided [context] map, and evaluates the feature identified by [featureKey].
   * The evaluation result (enabled status and variables) is returned asynchronously
   * through the [promise].
   *
   * @param featureKey The unique key identifying the feature flag to evaluate.
   * @param accountId The VWO account identifier for the target SDK instance.
   * @param sdkKey The SDK key for the target SDK instance.
   * @param context A [ReadableMap] representing the user context. Expected keys:
   *   - `id` (String): The unique user identifier.
   *   - `customVariables` (Map, optional): Custom targeting variables for the user.
   * @param promise A [Promise] resolved with a [WritableMap] containing `isEnabled` (Boolean)
   *   and `variables` (Array) on success, or rejected with `VWO_INSTANCE_ERROR` if the
   *   instance is unavailable, or `GET_FLAG_FAILED` if the evaluation fails.
   */
  @ReactMethod
  fun getFlag(
    featureKey: String,
    accountId: Int,
    sdkKey: String,
    context: ReadableMap,
    promise: Promise
  ) {
    val vwoUserContext = VWOUserContext().apply {
      this.id = context.getString("id") ?: ""
      this.customVariables = extractCustomVariables(context)
      this.shouldUseDeviceIdAsUserId = getUseDeviceIdAsUserIdFlag(context)
    }

    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance == null) {
      promise.reject("VWO_INSTANCE_ERROR", requireInstanceError())
      return
    }

    val listener = object : IVwoListener {
      override fun onSuccess(result: Any) {
        if (result is GetFlag) {
          promise.resolve(result.toWritableMap())
        } else {
          promise.reject("GET_FLAG_FAILED", "Unexpected result type")
        }
      }

      override fun onFailure(error: String) {
        promise.reject("GET_FLAG_FAILED", error)
      }
    }

    vwoInstance.getFlag(featureKey, vwoUserContext, listener)
  }

  /**
   * Tracks a custom event for the specified user context on a given VWO instance.
   *
   * Sends the event identified by [eventName] along with optional [eventProperties]
   * to the VWO backend for analytics and goal tracking. The user is identified
   * through the [context] map.
   *
   * @param eventName The name of the event to track (e.g., "purchase", "signup").
   * @param accountId The VWO account identifier for the target SDK instance.
   * @param sdkKey The SDK key for the target SDK instance.
   * @param context A [ReadableMap] representing the user context. Expected keys:
   *   - `id` (String): The unique user identifier.
   * @param eventProperties An optional [ReadableMap] of key-value pairs representing
   *   additional properties associated with the event (e.g., revenue, product category).
   * @param promise A [Promise] resolved with `null` on success, or rejected with
   *   `VWO_INSTANCE_ERROR` if the SDK instance is unavailable.
   */
  @ReactMethod
  fun trackEvent(
    eventName: String,
    accountId: Int,
    sdkKey: String,
    context: ReadableMap,
    eventProperties: ReadableMap?,
    promise: Promise
  ) {
    val vwoUserContext = VWOUserContext().apply {
      this.id = context.getString("id") ?: ""
      this.customVariables = extractCustomVariables(context)
      this.shouldUseDeviceIdAsUserId = getUseDeviceIdAsUserIdFlag(context)
    }
    val properties = eventProperties?.toHashMap()?.filterValues { it != null } as Map<String, Any>
      ?: emptyMap<String, Any>()

    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance == null) {
      promise.reject("VWO_INSTANCE_ERROR", requireInstanceError())
      return
    }

    vwoInstance.trackEvent(eventName, vwoUserContext, properties)
    promise.resolve("Success")
  }

  /**
   * Sets one or more user attributes for the specified user context on a given VWO instance.
   *
   * User attributes are used for targeting and segmentation in VWO campaigns.
   * The attributes are sent to the VWO backend and associated with the user
   * identified by the [context] map.
   *
   * @param attributes A [ReadableMap] of attribute key-value pairs to set
   *   (e.g., `{"plan": "premium", "age": 30}`).
   * @param accountId The VWO account identifier for the target SDK instance.
   * @param sdkKey The SDK key for the target SDK instance.
   * @param context A [ReadableMap] representing the user context. Expected keys:
   *   - `id` (String): The unique user identifier.
   * @param promise A [Promise] resolved with `null` on success, or rejected with
   *   `VWO_INSTANCE_ERROR` if the SDK instance is unavailable.
   */
  @ReactMethod
  fun setAttribute(
    attributes: ReadableMap,
    accountId: Int,
    sdkKey: String,
    context: ReadableMap,
    promise: Promise
  ) {
    val vwoUserContext = VWOUserContext().apply {
      this.id = context.getString("id") ?: ""
      this.customVariables = extractCustomVariables(context)
      this.shouldUseDeviceIdAsUserId = getUseDeviceIdAsUserIdFlag(context)
    }
    val attributesMap = attributes.toHashMap().filterValues { it != null } as Map<String, Any>

    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance == null) {
      promise.reject("VWO_INSTANCE_ERROR", requireInstanceError())
      return
    }

    vwoInstance.setAttribute(attributesMap, vwoUserContext)
    promise.resolve("Success")
  }

  /**
   * Creates an alias that links one user identity to another on a given VWO instance.
   *
   * Aliasing is used to merge user identities — for example, linking an anonymous
   * visitor ID to a logged-in user ID — so that VWO can unify their experiment
   * and event data. This method validates the inputs before delegating to the
   * underlying SDK.
   *
   * @param fromContext An optional [ReadableMap] representing the original user context. Expected keys:
   *   - `id` (String): The original user identifier to alias from.
   *   - `customVariables` (Map, optional): Custom targeting variables for the user.
   *   - `shouldUseDeviceIdAsUserId` (Boolean, optional): Whether to use the device ID as the user ID.
   * @param toAlias The target alias string to associate with the user. Must be non-empty after trimming.
   * @param accountId The VWO account identifier for the target SDK instance.
   * @param sdkKey The SDK key for the target SDK instance.
   * @param promise A [Promise] resolved with `null` on success, or rejected with
   *   `INVALID_ARGS` if required arguments are missing, or `VWO_INSTANCE_ERROR`
   *   if the SDK instance is unavailable.
   */
  @ReactMethod
  fun setAlias(
    fromContext: ReadableMap?,
    toAlias: String?,
    accountId: Int,
    sdkKey: String,
    promise: Promise
  ) {

    if (fromContext == null) {
      promise.reject("INVALID_ARGS", "setAlias requires userContext (fromContext).")
      return
    }

    val alias = (toAlias ?: "").trim()
    if (alias.isEmpty()) {
      promise.reject("INVALID_ARGS", "setAlias requires a non-empty alias.")
      return
    }

    val vwoUserContext = VWOUserContext().apply {
      this.id = fromContext.getString("id") ?: ""
      this.customVariables = extractCustomVariables(fromContext)
      this.shouldUseDeviceIdAsUserId = getUseDeviceIdAsUserIdFlag(fromContext)
    }

    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance == null) {
      promise.reject("VWO_INSTANCE_ERROR", requireInstanceError())
      return
    }

    vwoInstance.setAlias(vwoUserContext, alias)
    promise.resolve("Success")
  }

  private fun extractCustomVariables(fromContext: ReadableMap?): HashMap<String, Any> {
    return fromContext?.getMap("customVariables")?.toHashMap()
      ?.filterValues { it != null } as? HashMap<String, Any> ?: HashMap<String, Any>()
  }

  private fun getUseDeviceIdAsUserIdFlag(fromContext: ReadableMap?): Boolean {
    if (fromContext == null) return false
    return if (fromContext.hasKey("shouldUseDeviceIdAsUserId") && !fromContext.isNull("shouldUseDeviceIdAsUserId")) {
      fromContext.getBoolean("shouldUseDeviceIdAsUserId")
    } else {
      false
    }
  }

  /**
   * Sets the session data for the current VWO FME session.
   *
   * Session data is stored globally via [FMEConfig] and is used by the SDK
   * to associate events and evaluations with the current user session.
   * If the `sessionId` value is a [Double] (as received from JavaScript's number type),
   * it is converted to a [Long] before being stored to preserve precision.
   *
   * @param data A [ReadableMap] containing session data key-value pairs.
   *   Expected keys include `sessionId` (Number) and any additional session-level metadata.
   */
  @ReactMethod
  fun setSessionData(data: ReadableMap) {
    val sessionData = data.toHashMap().filterValues { it != null }.toMutableMap()
    val sessionIdValue = sessionData["sessionId"]
    if (sessionIdValue is Double) {
      val sessionIdLong = sessionIdValue.toLong()
      sessionData["sessionId"] = sessionIdLong
    }
    FMEConfig.setSessionData(sessionData as Map<String, Any>)
  }

  /**
   * Sends the SDK initialization time to the native VWO SDK for performance tracking.
   *
   * This allows the VWO backend to collect metrics about how long the SDK
   * initialization took on the client side, which is useful for monitoring
   * SDK health and performance across different environments.
   *
   * @param initTimeMs The SDK initialization duration in milliseconds (as a [Double]
   *   since React Native bridges numbers as doubles). Converted to [Long] before sending.
   * @param accountId The VWO account identifier for the target SDK instance.
   * @param sdkKey The SDK key for the target SDK instance.
   * @param promise A [Promise] resolved with `null` on success, or rejected with
   *   `INVALID_ARGS` if credentials are missing, `VWO_INSTANCE_ERROR` if the instance
   *   is unavailable, or `SEND_SDK_INIT_EVENT_ERROR` if an exception occurs.
   */
  @ReactMethod
  fun sendSdkInitTime(initTimeMs: Double, accountId: Int, sdkKey: String, promise: Promise) {
    val vwoInstance = getVWOInstance(accountId, sdkKey)
    if (vwoInstance == null) {
      promise.reject("VWO_INSTANCE_ERROR", requireInstanceError())
      return
    }
    try {
      vwoInstance.sendSdkInitEvent(initTimeMs.toLong())
      promise.resolve("Success")
    } catch (e: Exception) {
      promise.reject("SEND_SDK_INIT_EVENT_ERROR", e.message ?: "Failed to send SDK init event.")
    }
  }

  /**
   * Converts a [ReadableMap] (from the React Native bridge) into a [HashMap].
   *
   * Iterates over all keys in the map and recursively converts nested maps and arrays
   * into their native Kotlin equivalents. This is necessary because [ReadableMap] is
   * a React Native bridge type that cannot be used directly with the VWO SDK.
   *
   * @receiver The [ReadableMap] to convert.
   * @return A [HashMap] with string keys and nullable values mirroring the structure
   *   of the original [ReadableMap].
   */
  fun ReadableMap.toHashMap(): HashMap<String, Any?> {
    val map = HashMap<String, Any?>()
    val iterator = this.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      when (this.getType(key)) {
        ReadableType.Boolean -> map[key] = this.getBoolean(key)
        ReadableType.Number -> map[key] = this.getDouble(key)
        ReadableType.String -> map[key] = this.getString(key)
        ReadableType.Map -> map[key] = this.getMap(key)?.toHashMap() ?: HashMap<String, Any?>()
        ReadableType.Array -> map[key] = this.getArray(key)?.toArrayList() ?: ArrayList<Any>()
        else -> {}
      }
    }
    return map
  }

  /**
   * Converts a [ReadableArray] (from the React Native bridge) into an [ArrayList].
   *
   * Iterates over all elements in the array and recursively converts nested maps and arrays
   * into their native Kotlin equivalents. Handles all primitive types supported by the
   * React Native bridge: Boolean, Number, String, Map, and Array.
   *
   * @receiver The [ReadableArray] to convert.
   * @return An [ArrayList] containing the converted elements from the original [ReadableArray].
   */
  fun ReadableArray.toArrayList(): ArrayList<Any> {
    val list = ArrayList<Any>()
    for (i in 0 until this.size()) {
      when (this.getType(i)) {
        ReadableType.Boolean -> list.add(this.getBoolean(i))
        ReadableType.Number -> list.add(this.getDouble(i))
        ReadableType.String -> list.add(this.getString(i) ?: "")
        ReadableType.Map -> list.add(this.getMap(i)?.toHashMap() ?: HashMap<String, Any>())
        ReadableType.Array -> list.add(this.getArray(i)?.toArrayList() ?: ArrayList<Any>())
        else -> {}
      }
    }
    return list
  }

  /**
   * Converts a [GetFlag] result into a [WritableMap] suitable for the React Native bridge.
   *
   * Transforms the feature flag evaluation result into a serializable map containing:
   * - `isEnabled`: Whether the feature flag is enabled for the evaluated user.
   * - `variables`: An array of variable objects, each containing `key`, `type`, `id`, and `value`.
   *
   * JSON-type variables are recursively converted into nested [WritableMap] or [WritableArray]
   * structures. All other variable types are mapped to their corresponding bridge primitives.
   *
   * @receiver The [GetFlag] instance returned from a feature flag evaluation.
   * @return A [WritableMap] representing the flag state and its associated variables,
   *   ready to be sent across the React Native bridge to JavaScript.
   */
  fun GetFlag.toWritableMap(): WritableMap {
    val map = Arguments.createMap()
    map.putBoolean("isEnabled", this.isEnabled())
    val variablesArray = Arguments.createArray()
    this.getVariables().forEach { variable ->
      val variableMap = Arguments.createMap()
      variableMap.putString("key", variable["key"] as? String)
      variableMap.putString("type", variable["type"] as? String)
      variableMap.putInt("id", variable["id"] as? Int ?: 0)

      val type = variable["type"] as? String
      val value = variable["value"]
      if (type == "json") {
        when (value) {
          is Map<*, *> -> variableMap.putMap("value", mapToWritableMap(value))
          is List<*> -> variableMap.putArray("value", listToWritableArray(value))
          else -> variableMap.putString("value", value.toString())
        }
      } else {
        when (value) {
          is String -> variableMap.putString("value", value)
          is Int -> variableMap.putInt("value", value)
          is Double -> variableMap.putDouble("value", value)
          is Boolean -> variableMap.putBoolean("value", value)
          else -> variableMap.putString("value", value.toString())
        }
      }
      variablesArray.pushMap(variableMap)
    }
    map.putArray("variables", variablesArray)
    return map
  }

  /**
   * Recursively converts a generic [Map] into a [WritableMap] for the React Native bridge.
   *
   * Handles nested maps, lists, and all primitive types (Boolean, Int, Double, String).
   * Any unsupported value types are converted to their string representation via [toString].
   *
   * @param linkedHashMap The source map to convert. Keys are cast to [String].
   * @return A [WritableMap] that mirrors the structure of the input map and is
   *   compatible with the React Native bridge serialization format.
   */
  fun mapToWritableMap(linkedHashMap: Map<*, *>): WritableMap {
    val writableMap = Arguments.createMap()
    for ((key, value) in linkedHashMap) {
      when (value) {
        is Map<*, *> -> writableMap.putMap(key as String, mapToWritableMap(value))
        is List<*> -> writableMap.putArray(key as String, listToWritableArray(value))
        is Boolean -> writableMap.putBoolean(key as String, value)
        is Int -> writableMap.putInt(key as String, value)
        is Double -> writableMap.putDouble(key as String, value)
        is String -> writableMap.putString(key as String, value)
        else -> writableMap.putString(key as String, value.toString())
      }
    }
    return writableMap
  }

  /**
   * Recursively converts a generic [List] into a [WritableArray] for the React Native bridge.
   *
   * Handles nested maps, lists, and all primitive types (String, Int, Double, Boolean).
   * Any unsupported element types are converted to their string representation via [toString].
   *
   * @param list The source list to convert.
   * @return A [WritableArray] that mirrors the structure of the input list and is
   *   compatible with the React Native bridge serialization format.
   */
  fun listToWritableArray(list: List<*>): WritableArray {
    val array = Arguments.createArray()
    list.forEach { element ->
      when (element) {
        is String -> array.pushString(element)
        is Int -> array.pushInt(element)
        is Double -> array.pushDouble(element)
        is Boolean -> array.pushBoolean(element)
        is Map<*, *> -> array.pushMap(mapToWritableMap(element))
        is List<*> -> array.pushArray(listToWritableArray(element))
        else -> array.pushString(element.toString())
      }
    }
    return array
  }

  /**
   * The [ReactContext] used to emit events from the native side to the JavaScript layer.
   *
   * Initialized with the [ReactApplicationContext] provided during module construction.
   */
  private val eventEmitter: ReactContext = reactContext

  /**
   * Emits a named event with optional parameters to the JavaScript layer.
   *
   * Uses React Native's [RCTDeviceEventEmitter][ReactContext.RCTDeviceEventEmitter]
   * to dispatch events that can be listened to on the JavaScript side using
   * `DeviceEventEmitter.addListener(eventName, ...)`.
   *
   * @param eventName The name of the event to emit (e.g., "LogEvent", "IntegrationCallbackEvent").
   * @param params An optional [WritableMap] containing the event payload data,
   *   or `null` if no additional data is needed.
   */
  fun sendEvent(eventName: String, params: WritableMap?) {
    eventEmitter.getJSModule(ReactContext.RCTDeviceEventEmitter::class.java).emit(eventName, params)
  }

  /**
   * Companion object holding constants for [VwoFmeReactNativeSdkModule].
   */
  companion object {
    /** The name used to register this module with the React Native bridge. */
    const val NAME = "VwoFmeReactNativeSdk"
  }
}
