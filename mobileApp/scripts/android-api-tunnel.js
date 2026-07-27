#!/usr/bin/env node
/**
 * Tunnel host :5000 into the Android device/emulator as localhost:5000.
 * Required when API host is localhost on a physical device, and a reliable
 * fallback when 10.0.2.2 is unreachable from the emulator.
 */
const { execSync } = require('child_process');

const port = process.env.EXPO_PUBLIC_API_PORT || '5000';

try {
  const devices = execSync('adb devices', { encoding: 'utf8' });
  const hasDevice = devices
    .split('\n')
    .some((line) => /\tdevice$/.test(line.trim()) || /\tdevice\r?$/.test(line));

  if (!hasDevice) {
    console.warn(
      `[ShopMaster] No Android device via adb. If using a physical phone, set EXPO_PUBLIC_API_HOST to your LAN IP (e.g. 192.168.x.x).`,
    );
    process.exit(0);
  }

  execSync(`adb reverse tcp:${port} tcp:${port}`, { stdio: 'inherit' });
  console.log(`[ShopMaster] adb reverse tcp:${port} tcp:${port} OK`);
} catch (error) {
  console.warn(
    `[ShopMaster] adb reverse skipped: ${error instanceof Error ? error.message : String(error)}`,
  );
}
