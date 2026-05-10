import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wherekhadame.app',
  appName: 'Bayti Assist',
  webDir: 'dist',
  plugins: {
    BackgroundGeolocation: {
      // Android: notification shown while tracking is active (foreground service)
      notificationTitle: 'Live Tracking Active',
      notificationText: 'Your location is being shared with your employer.',
      notificationIconColor: '#1a73e8',
    },
  },
};

export default config;
