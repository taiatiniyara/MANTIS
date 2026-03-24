# MANTIS Mobile - Release Checklist

This checklist is for preparing iOS and Android production builds with EAS.

## 1) One-Time Setup

- Install EAS CLI:
  ```bash
  npm install -g eas-cli
  ```
- Log in:
  ```bash
  eas login
  ```
- Configure project linkage:
  - Set `expo.extra.eas.projectId` in `mobile/app.json`
  - Current project ID is configured as `b502126b-f7d3-4db4-9e70-7a228d499edb`
- Confirm identifiers in `mobile/app.json`:
  - `expo.ios.bundleIdentifier`
  - `expo.android.package`

## 2) Environment and Secrets

- Confirm mobile env vars exist in `mobile/.env.local` for local validation:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_KEY`
- Use `mobile/release.env.example` as the template for CI/secret values
- Configure EAS secrets for cloud builds as needed:
  ```bash
  eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <value>
  eas secret:create --name EXPO_PUBLIC_SUPABASE_KEY --value <value>
  ```

## 3) Pre-Build Quality Gate

Run before any release build:

```bash
cd mobile
npm install
npm run lint
npm run release:check
```

Manual smoke checks:
- Login + password reset
- Create infringement (online + offline queue)
- Cases details (driver license + vehicle plate shown)
- Draft edit/delete
- Profile sync/sign out
- Tab icon/label alignment on target device

## 4) Build Profiles

`mobile/eas.json` includes:
- `development` (dev client, internal)
- `preview` (internal distribution)
- `production` (store-ready, autoIncrement enabled)

Credential setup note:
- First production build per platform may require interactive credential setup (`npx eas build --platform ios --profile production` and/or `npx eas build --platform android --profile production`) before CI/non-interactive runs can succeed.

## 5) Build Commands

From `mobile/`:

```bash
npm run build:preview:ios
npm run build:preview:android
npm run build:production:ios
npm run build:production:android
```

One-command guarded release builds:

```bash
npm run release:production:ios
npm run release:production:android
```

## 6) Submit Commands

```bash
npm run submit:production:ios
npm run submit:production:android
```

## 6.1) GitHub Actions Release Pipeline

A CI workflow is available at:

- `.github/workflows/mobile-release.yml`

Trigger modes:
- Push a tag like `v1.0.1` to run production iOS + Android builds
- Run manually from GitHub Actions (`workflow_dispatch`) and choose `all`, `ios`, or `android`

Required GitHub repository secrets:
- `EXPO_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`

Notes:
- CI runs `npm run release:check` and `npm run lint` before building
- EAS builds are started with `--no-wait` for fast CI completion

## 7) App Store Metadata Checklist

- App name and subtitle
- Description (short + long)
- Keywords
- Privacy policy URL
- Support URL
- App icon and screenshots
- Age rating / content declarations
- Data safety / privacy labels

## 8) Versioning Rules

- Bump `expo.version` for each public release
- `runtimeVersion.policy = appVersion` is enabled in `app.json`
- `eas.json` production build uses `autoIncrement: true` for platform build numbers

## 9) OTA Update Policy

Current config in `app.json`:
- Updates enabled
- `checkAutomatically = ON_LOAD`
- `fallbackToCacheTimeout = 0`
- `updates.url` configured to the EAS project URL

Use EAS Update channels that match build profiles (`development`, `preview`, `production`) to avoid accidental cross-channel updates.
