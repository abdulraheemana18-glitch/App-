import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Wifi,
  Battery,
} from 'lucide-react';
import { api } from '../services/api';

export const AndroidScreen: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [manifestText, setManifestText] = useState<string>('');
  const [capacitorConfigText, setCapacitorConfigText] = useState<string>('');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event for real Android installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Load initial configs
    setCapacitorConfigText(`import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.superintelligence.app',
  appName: 'SUPER INTELLIGENCE AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#030712',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030712',
    },
  },
};

export default config;`);

    setManifestText(`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ai.superintelligence.app">

    <!-- Essential Android Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SUPER INTELLIGENCE"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleTriggerInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const outcome = await installPromptEvent.userChoice;
      console.log('Install outcome:', outcome);
      setInstallPromptEvent(null);
    } else {
      alert('PWA is ready. On Android Chrome: Tap Menu (⋮) → "Install App" or "Add to Home Screen".');
    }
  };

  const handleDownloadBundle = () => {
    const bundleData = {
      project: 'SUPER INTELLIGENCE AI - Android Package',
      version: '1.0.0',
      capacitorConfig: capacitorConfigText,
      androidManifest: manifestText,
      buildInstructions: [
        'npm run build',
        'npx cap add android',
        'npx cap sync android',
        'cd android && ./gradlew assembleDebug',
      ],
    };
    const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'super-intelligence-android-bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildCommands = [
    {
      label: '1. Build Web Assets',
      cmd: 'npm run build',
    },
    {
      label: '2. Synchronize Native Android Bridge',
      cmd: 'npx cap sync android',
    },
    {
      label: '3. Build Debug APK',
      cmd: 'cd android && ./gradlew assembleDebug',
    },
    {
      label: '4. Build Signed Release APK',
      cmd: 'cd android && ./gradlew assembleRelease',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 select-text">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-1">
            <Smartphone className="w-4 h-4" />
            <span>ANDROID APPLICATION & NATIVE APK PIPELINE</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Complete Android deployment configuration using Capacitor 6.0 and Jetpack Compose. Install directly as an Android PWA or build native APK binaries with Gradle.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerInstall}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Android Device</span>
          </button>

          <button
            onClick={handleDownloadBundle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Config Bundle</span>
          </button>
        </div>
      </div>

      {/* Grid: APK Build Instructions & Device Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Build Pipeline & Terminal Steps */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Native APK Build Pipeline (Terminal / Gradle)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Run these commands in your Android Studio environment or terminal to produce production APKs:
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {buildCommands.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{item.label}</span>
                    <button
                      onClick={() => copyToClipboard(item.cmd, `cmd-${idx}`)}
                      className="hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedCmd === `cmd-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <div className="text-cyan-300 text-xs">$ {item.cmd}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
              <div className="font-bold text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Target Architecture Verification</span>
              </div>
              <div>• Android Target SDK: 34 (Android 14) • Minimum SDK: 24 (Android 7.0+)</div>
              <div>• Architecture: Universal APK (arm64-v8a, armeabi-v7a, x86_64)</div>
            </div>
          </div>

          {/* Android Manifest Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">AndroidManifest.xml Preview</span>
              <button
                onClick={() => copyToClipboard(manifestText, 'manifest')}
                className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px]"
              >
                {copiedCmd === 'manifest' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Manifest</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre">
              {manifestText}
            </pre>
          </div>
        </div>

        {/* Right Column: Capacitor Configuration & Device Simulator */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">capacitor.config.ts Configuration</span>
              <button
                onClick={() => copyToClipboard(capacitorConfigText, 'cap')}
                className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px]"
              >
                {copiedCmd === 'cap' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Config</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-64 whitespace-pre">
              {capacitorConfigText}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Android Hardware Feature Matrix</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Bar</span>
                <span className="text-emerald-400 font-semibold">Dark Immersive</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Keyboard</span>
                <span className="text-emerald-400 font-semibold">AdjustResize Auto</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Haptics</span>
                <span className="text-emerald-400 font-semibold">Touch Vibrate Ready</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Storage</span>
                <span className="text-emerald-400 font-semibold">SQLite / IndexedDB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
