const IS_DEV = process.env.APP_VARIANT === 'dev';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getAppName = () => {
  if (IS_DEV) return 'KooM! (Dev)';
  if (IS_STAGING) return 'KooM! (Staging)';
  return 'KooM!';
};

const getBundleIdentifier = () => {
  if (IS_DEV) return 'com.ursineenterprises.nochoicealarm.dev';
  if (IS_STAGING) return 'com.ursineenterprises.nochoicealarm.staging';
  return 'com.ursineenterprises.nochoicealarm';
};

const getAndroidPackage = () => {
  if (IS_DEV) return 'com.ursineenterprises.nochoicealarm.dev';
  if (IS_STAGING) return 'com.ursineenterprises.nochoicealarm.staging';
  return 'com.ursineenterprises.nochoicealarm';
};

export default {
  expo: {
    name: getAppName(),
    slug: 'no-choice-alarm',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon_2025.png',
    scheme: 'nochoicealarm',
    userInterfaceStyle: 'automatic',
    ios: {
      buildNumber: '2025.11.21.3',
      supportsTablet: true,
      bundleIdentifier: getBundleIdentifier(),
      deploymentTarget: '16.4',
    },
    android: {
      versionCode: 2025112103,
      adaptiveIcon: {
        foregroundImage: './assets/images/icon_2025.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: getAndroidPackage(),
      permissions: ['INTERNET', 'WAKE_LOCK'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/icon_2025.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        slug: 'no-choice-alarm',
        projectId: '146fee5c-6c6b-4e0c-bb3e-78a134f01845',
      },
      appVariant: process.env.APP_VARIANT || 'production',
    },
    owner: 'ursineenterprises',
  },
};
