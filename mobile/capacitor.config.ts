import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proyectofinanzas.mobile',
  appName: 'Proyecto Finanzas',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
