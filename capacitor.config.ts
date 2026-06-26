import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jishnu.mafiamoderator",
  appName: "Mafia Moderator",
  webDir: "www",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: { launchShowDuration: 3000 },
  },
};

export default config;
