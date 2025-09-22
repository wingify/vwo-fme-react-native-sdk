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

import { LogLevel } from '../types';
import type {
  VWOInitOptions,
  VWOUserContext,
  Variable,
  GetFlag,
  GetFlagResult,
} from '../types';

describe('TypeScript Types and Interfaces', () => {
  describe('LogLevel enum', () => {
    it('should have correct enum values', () => {
      expect(LogLevel.trace).toBe('TRACE');
      expect(LogLevel.debug).toBe('DEBUG');
      expect(LogLevel.info).toBe('INFO');
      expect(LogLevel.warn).toBe('WARN');
      expect(LogLevel.error).toBe('ERROR');
    });

    it('should have all expected log levels', () => {
      const expectedLevels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
      const actualLevels = Object.values(LogLevel);
      expect(actualLevels).toEqual(expectedLevels);
    });
  });

  describe('VWOInitOptions interface', () => {
    it('should allow creation with minimal required properties', () => {
      const options: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
        accountId: 12345,
      };

      expect(options.sdkKey).toBe('test-sdk-key');
      expect(options.accountId).toBe(12345);
      expect(options.logLevel).toBeUndefined();
      expect(options.logPrefix).toBeUndefined();
      expect(options.integrations).toBeUndefined();
      expect(options.gatewayService).toBeUndefined();
      expect(options.cachedSettingsExpiryTime).toBeUndefined();
      expect(options.pollInterval).toBeUndefined();
      expect(options.batchMinSize).toBeUndefined();
      expect(options.batchUploadTimeInterval).toBeUndefined();
      expect(options.isUsageStatsDisabled).toBeUndefined();
      expect(options.vwoMeta).toBeUndefined();
    });

    it('should allow creation with all properties', () => {
      const options: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
        accountId: 12345,
        logLevel: LogLevel.info,
        logPrefix: 'VWO',
        integrations: { custom: 'integration' },
        gatewayService: { url: 'https://gateway.vwo.com' },
        cachedSettingsExpiryTime: 60000,
        pollInterval: 30000,
        batchMinSize: 10,
        batchUploadTimeInterval: 120000,
        isUsageStatsDisabled: true,
        vwoMeta: { customKey: 'customValue' },
      };

      expect(options.sdkKey).toBe('test-sdk-key');
      expect(options.accountId).toBe(12345);
      expect(options.logLevel).toBe(LogLevel.info);
      expect(options.logPrefix).toBe('VWO');
      expect(options.integrations).toEqual({ custom: 'integration' });
      expect(options.gatewayService).toEqual({
        url: 'https://gateway.vwo.com',
      });
      expect(options.cachedSettingsExpiryTime).toBe(60000);
      expect(options.pollInterval).toBe(30000);
      expect(options.batchMinSize).toBe(10);
      expect(options.batchUploadTimeInterval).toBe(120000);
      expect(options.isUsageStatsDisabled).toBe(true);
      expect(options.vwoMeta).toEqual({ customKey: 'customValue' });
    });

    it('should allow partial properties', () => {
      const options: VWOInitOptions = {
        sdkKey: 'test-sdk-key',
        logLevel: LogLevel.debug,
        vwoMeta: { lv: '1.0.0' },
      };

      expect(options.sdkKey).toBe('test-sdk-key');
      expect(options.logLevel).toBe(LogLevel.debug);
      expect(options.vwoMeta).toEqual({ lv: '1.0.0' });
      expect(options.accountId).toBeUndefined();
    });
  });

  describe('VWOUserContext interface', () => {
    it('should allow creation with minimal properties', () => {
      const context: VWOUserContext = {};

      expect(context.id).toBeUndefined();
      expect(context.customVariables).toBeUndefined();
    });

    it('should allow creation with all properties', () => {
      const context: VWOUserContext = {
        id: 'user123',
        customVariables: {
          plan: 'premium',
          age: 25,
          country: 'US',
          isSubscribed: true,
        },
      };

      expect(context.id).toBe('user123');
      expect(context.customVariables).toEqual({
        plan: 'premium',
        age: 25,
        country: 'US',
        isSubscribed: true,
      });
    });

    it('should allow various data types in customVariables', () => {
      const context: VWOUserContext = {
        id: 'user123',
        customVariables: {
          stringValue: 'test',
          numberValue: 42,
          booleanValue: true,
          nullValue: null,
          arrayValue: [1, 2, 3],
          objectValue: { nested: 'value' },
        },
      };

      expect(context.customVariables?.stringValue).toBe('test');
      expect(context.customVariables?.numberValue).toBe(42);
      expect(context.customVariables?.booleanValue).toBe(true);
      expect(context.customVariables?.nullValue).toBeNull();
      expect(context.customVariables?.arrayValue).toEqual([1, 2, 3]);
      expect(context.customVariables?.objectValue).toEqual({ nested: 'value' });
    });
  });

  describe('Variable interface', () => {
    it('should allow creation with all required properties', () => {
      const variable: Variable = {
        key: 'test-key',
        value: 'test-value',
        type: 'string',
        id: 1,
      };

      expect(variable.key).toBe('test-key');
      expect(variable.value).toBe('test-value');
      expect(variable.type).toBe('string');
      expect(variable.id).toBe(1);
    });

    it('should allow various value types', () => {
      const stringVar: Variable = {
        key: 'string-key',
        value: 'string-value',
        type: 'string',
        id: 1,
      };

      const numberVar: Variable = {
        key: 'number-key',
        value: 42,
        type: 'number',
        id: 2,
      };

      const booleanVar: Variable = {
        key: 'boolean-key',
        value: true,
        type: 'boolean',
        id: 3,
      };

      const objectVar: Variable = {
        key: 'object-key',
        value: { nested: 'value' },
        type: 'object',
        id: 4,
      };

      expect(stringVar.value).toBe('string-value');
      expect(numberVar.value).toBe(42);
      expect(booleanVar.value).toBe(true);
      expect(objectVar.value).toEqual({ nested: 'value' });
    });

    it('should allow undefined values', () => {
      const variable: Variable = {
        key: 'undefined-key',
        value: undefined,
        type: 'string',
        id: 1,
      };

      expect(variable.value).toBeUndefined();
    });
  });

  describe('GetFlag interface', () => {
    it('should have correct structure', () => {
      const getFlag: GetFlag = {
        isEnabled: true,
        variables: [
          {
            key: 'test-key',
            value: 'test-value',
            type: 'string',
            id: 1,
          },
        ],
      };

      expect(getFlag.isEnabled).toBe(true);
      expect(getFlag.variables).toHaveLength(1);

      const arrVar: any = getFlag.variables;
      expect(arrVar[0].key).toBe('test-key');
    });

    it('should allow disabled flag with empty variables', () => {
      const getFlag: GetFlag = {
        isEnabled: false,
        variables: [],
      };

      expect(getFlag.isEnabled).toBe(false);
      expect(getFlag.variables).toHaveLength(0);
    });
  });

  describe('GetFlagResult interface', () => {
    it('should have correct method signatures', () => {
      // This is a runtime test to ensure the interface is properly implemented
      const mockResult: GetFlagResult = {
        isEnabled: jest.fn().mockReturnValue(true),
        getVariable: jest.fn().mockReturnValue('test-value'),
        getVariables: jest.fn().mockReturnValue([]),
      };

      expect(typeof mockResult.isEnabled).toBe('function');
      expect(typeof mockResult.getVariable).toBe('function');
      expect(typeof mockResult.getVariables).toBe('function');

      expect(mockResult.isEnabled()).toBe(true);
      expect(mockResult.getVariable('test', 'default')).toBe('test-value');
      expect(mockResult.getVariables()).toEqual([]);
    });
  });

  describe('Type compatibility tests', () => {
    it('should allow VWOInitOptions to be used in function parameters', () => {
      const testFunction = (options: VWOInitOptions) => {
        return options.sdkKey;
      };

      const result = testFunction({ sdkKey: 'test-key' });
      expect(result).toBe('test-key');
    });

    it('should allow VWOUserContext to be used in function parameters', () => {
      const testFunction = (context: VWOUserContext) => {
        return context.id;
      };

      const result = testFunction({ id: 'user123' });
      expect(result).toBe('user123');
    });

    it('should allow Variable arrays to be used in function parameters', () => {
      const testFunction = (variables: Variable[]) => {
        return variables.length;
      };

      const variables: Variable[] = [
        { key: 'key1', value: 'value1', type: 'string', id: 1 },
        { key: 'key2', value: 'value2', type: 'string', id: 2 },
      ];

      const result = testFunction(variables);
      expect(result).toBe(2);
    });

    it('should allow GetFlagResult to be returned from functions', () => {
      const createMockResult = (): GetFlagResult => ({
        isEnabled: () => true,
        getVariable: (_: string, defaultValue: any) => defaultValue,
        getVariables: () => [],
      });

      const result = createMockResult();
      expect(result.isEnabled()).toBe(true);
      expect(result.getVariable('test', 'default')).toBe('default');
      expect(result.getVariables()).toEqual([]);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty strings in VWOInitOptions', () => {
      const options: VWOInitOptions = {
        sdkKey: '',
        logPrefix: '',
      };

      expect(options.sdkKey).toBe('');
      expect(options.logPrefix).toBe('');
    });

    it('should handle zero and negative numbers in VWOInitOptions', () => {
      const options: VWOInitOptions = {
        sdkKey: 'test',
        accountId: 0,
        pollInterval: -1,
        batchMinSize: -10,
      };

      expect(options.accountId).toBe(0);
      expect(options.pollInterval).toBe(-1);
      expect(options.batchMinSize).toBe(-10);
    });

    it('should handle empty objects in VWOUserContext', () => {
      const context: VWOUserContext = {
        id: '',
        customVariables: {},
      };

      expect(context.id).toBe('');
      expect(context.customVariables).toEqual({});
    });

    it('should handle empty string keys in Variable', () => {
      const variable: Variable = {
        key: '',
        value: 'test',
        type: 'string',
        id: 0,
      };

      expect(variable.key).toBe('');
      expect(variable.id).toBe(0);
    });

    it('should handle null values in customVariables', () => {
      const context: VWOUserContext = {
        customVariables: {
          nullValue: null,
          undefinedValue: undefined,
        },
      };

      expect(context.customVariables?.nullValue).toBeNull();
      expect(context.customVariables?.undefinedValue).toBeUndefined();
    });
  });
});
