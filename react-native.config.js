const path = require('path');
const fs = require('fs');

/**
 * Picks the CocoaPods spec that matches the published npm package name.
 *
 * - `vwo-fme-react-native-sdk` publish  -> vwo-fme-react-native-sdk.podspec (pod: vwo-fme-react-native-sdk)
 * - `wingify-fme-react-native-sdk` publish -> wingify-fme-react-native-sdk.podspec (pod: wingify-fme-react-native-sdk)
 *
 * Before Wingify release, copy package.wingify.json to package.json so `name` matches.
 */
function resolvePodspecPath() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  let packageName = 'vwo-fme-react-native-sdk';

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg && typeof pkg.name === 'string' && pkg.name.length > 0) {
      packageName = pkg.name;
    }
  } catch {
    // Default to VWO podspec if package.json is unavailable during config load.
  }

  const podspecFile =
    packageName === 'wingify-fme-react-native-sdk'
      ? 'wingify-fme-react-native-sdk.podspec'
      : 'vwo-fme-react-native-sdk.podspec';

  return path.join(__dirname, podspecFile);
}

module.exports = {
  dependency: {
    platforms: {
      ios: {
        podspecPath: resolvePodspecPath(),
      },
      android: {
        packageImportPath:
          'import com.vwofmereactnativesdk.FmeReactNativeSdkPackage;',
        packageInstance: 'new FmeReactNativeSdkPackage()',
      },
    },
  },
};
