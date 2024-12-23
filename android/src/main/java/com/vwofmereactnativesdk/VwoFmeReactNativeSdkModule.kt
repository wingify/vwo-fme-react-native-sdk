/**
 * Copyright 2024 Wingify Software Pvt. Ltd.
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
import com.vwo.models.user.VWOContext
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

class VwoFmeReactNativeSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Initialize the SDK with provided options
  @ReactMethod
    fun initialize(options: ReadableMap, promise: Promise) {
        val sdkKey = options.getString("sdkKey") ?: ""
        val accountId = options.getInt("accountId") ?: 0

        val gatewayService = options.getMap("gatewayService")?.toHashMap() ?: HashMap<String, Any>()

        val hasIntegrations = options.getBoolean("integrations") ?: false

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

        val loggerValue = options.getString("logLevel")
        val logger = mutableMapOf<String, Any>().apply {
            if (loggerValue != null) {
                put("level", loggerValue)
            } else {
                put("level", "ERROR")
            }
        }

        val sdkName = "vwo-fme-react-native-sdk"
        val sdkVersion = "1.0.0"
        
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

    // Retrieve a feature flag with the given context
    @ReactMethod
    fun getFlag(featureKey: String, context: ReadableMap, promise: Promise) {
        val vwoContext = VWOContext().apply {
            this.id = context.getString("id") ?: ""
            this.customVariables = context.getMap("customVariables")?.toHashMap() ?: HashMap<String, Any>()
            this.ipAddress = context.getString("ipAddress") ?: ""
            this.userAgent = context.getString("userAgent") ?: ""
        }
        VWO.getFlag(featureKey, vwoContext, object : IVwoListener {
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
        })
    }

    // Track an event with the given context and properties
    @ReactMethod
    fun trackEvent(eventName: String, context: ReadableMap, eventProperties: ReadableMap?) {
        val vwoContext = VWOContext().apply {
            this.id = context.getString("id") ?: ""
        }
        val properties = eventProperties?.toHashMap() ?: emptyMap<String, Any>()
        VWO.trackEvent(eventName, vwoContext, properties)
    }

    // Set an attribute for the given context
    @ReactMethod
    fun setAttribute(attributeKey: String, attributeValue: ReadableMap, context: ReadableMap) {
        val vwoContext = VWOContext().apply {
            this.id = context.getString("id") ?: ""
        }
        val attributeValueToSend: Any? = when {
            attributeValue.hasKey("value") -> {
                when (attributeValue.getType("value")) {
                    ReadableType.String -> attributeValue.getString("value")
                    ReadableType.Number -> attributeValue.getDouble("value")
                    ReadableType.Boolean -> attributeValue.getBoolean("value")
                    else -> {
                        throw IllegalArgumentException("Unsupported attribute value type")
                    }
                }
            }
            else -> null
        }
        print(attributeValueToSend)
        if (attributeValueToSend != null) {
            VWO.setAttribute(attributeKey, attributeValueToSend, vwoContext)
        }
    }

    fun ReadableMap.toHashMap(): HashMap<String, Any> {
        val map = HashMap<String, Any>()
        val iterator = this.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            when (this.getType(key)) {
                ReadableType.Boolean -> map[key] = this.getBoolean(key)
                ReadableType.Number -> map[key] = this.getDouble(key)
                ReadableType.String -> map[key] = this.getString(key) ?: ""
                ReadableType.Map -> map[key] = this.getMap(key)?.toHashMap() ?: HashMap<String, Any>()
                ReadableType.Array -> map[key] = this.getArray(key)?.toArrayList() ?: ArrayList<Any>()
                else -> {}
            }
        }
        return map
    }

    // Helper function to convert ReadableArray to ArrayList
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

    // Helper function to convert GetFlag to WritableMap
    fun GetFlag.toWritableMap(): WritableMap {
        val map = Arguments.createMap()
        map.putBoolean("isEnabled", this.isEnabled())
        val variablesArray = Arguments.createArray()
        this.getVariables().forEach { variable ->
            val variableMap = Arguments.createMap()
            variableMap.putString("key", variable["key"] as? String)
            variableMap.putString("type", variable["type"] as? String)
            variableMap.putInt("id", variable["id"] as? Int ?: 0)

            when (val value = variable["value"]) {
                is String -> variableMap.putString("value", value)
                is Int -> variableMap.putInt("value", value)
                is Double -> variableMap.putDouble("value", value)
                is Boolean -> variableMap.putBoolean("value", value)
                else -> variableMap.putString("value", value.toString())
            }
            variablesArray.pushMap(variableMap)
        }
        map.putArray("variables", variablesArray)
        return map
    }

    // Event emitter for sending events to JavaScript
    private val eventEmitter: ReactContext = reactContext

     // Function to send events to JavaScript
    fun sendEvent(eventName: String, params: WritableMap?) {
        eventEmitter.getJSModule(ReactContext.RCTDeviceEventEmitter::class.java).emit(eventName, params)
    }

    companion object {
    const val NAME = "VwoFmeReactNativeSdk"
  }
}
