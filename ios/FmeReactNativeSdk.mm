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

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(VwoFmeReactNativeSdk, RCTEventEmitter)

RCT_EXTERN_METHOD(initializeVwo:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initializeWingify:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initialize:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getClientSdkBrand:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getInstance:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(clearInstance:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getFlag:(nonnull NSString *)featureKey accountId:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey context:(nonnull NSDictionary *)context resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackEvent:(nonnull NSString *)eventName accountId:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey context:(nonnull NSDictionary *)context eventProperties:(nonnull NSDictionary *)eventProperties)
RCT_EXTERN_METHOD(setAttribute:(nonnull NSDictionary *)attributes accountId:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey context:(nonnull NSDictionary *)context)
RCT_EXTERN_METHOD(setAlias:(nonnull NSDictionary *)fromContext toAlias:(nonnull NSString *)toAlias accountId:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey)
RCT_EXTERN_METHOD(registerIntegrationCallback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(setSessionData:(nonnull NSDictionary *)data)
RCT_EXTERN_METHOD(sendSdkInitTime:(nonnull NSNumber *)initTimeMs accountId:(nonnull NSNumber *)accountId sdkKey:(nonnull NSString *)sdkKey)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
