import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'top.orosirian.civilpomo',
  appName: 'CivilPomo',
  webDir: 'out',
  server: {
    url: 'https://orosirian.top',
    cleartext: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#1a1a2e',
    },
  },
};

export default config;
