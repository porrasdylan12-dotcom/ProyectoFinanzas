import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proyectofinanzas.mobile',
  appName: 'Proyecto Finanzas',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // Solo para desarrollo: la API local se sirve por HTTP en la LAN.
    // Deshabilitar cuando la API se publique con HTTPS.
    allowMixedContent: true,
  },
};

export default config;
