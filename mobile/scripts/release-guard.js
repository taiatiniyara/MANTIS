const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileContains(filePath, key) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return new RegExp(`^${key}=`, 'm').test(content);
}

function hasEnvKey(key) {
  if (process.env[key]) return true;
  const dotEnvLocal = path.join(projectRoot, '.env.local');
  return fileContains(dotEnvLocal, key);
}

function main() {
  const appJsonPath = path.join(projectRoot, 'app.json');
  const easJsonPath = path.join(projectRoot, 'eas.json');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(appJsonPath)) {
    fail('mobile/app.json not found');
    return;
  }

  if (!fs.existsSync(easJsonPath)) {
    fail('mobile/eas.json not found');
    return;
  }

  const appJson = readJson(appJsonPath);
  const easJson = readJson(easJsonPath);
  const packageJson = readJson(packageJsonPath);

  const expo = appJson.expo || {};

  const projectId = expo?.extra?.eas?.projectId;
  if (!projectId || projectId === 'REPLACE_WITH_EAS_PROJECT_ID') {
    fail('expo.extra.eas.projectId is missing or placeholder in app.json');
  } else {
    ok('EAS projectId is configured');
  }

  if (!expo?.ios?.bundleIdentifier) {
    fail('expo.ios.bundleIdentifier is missing in app.json');
  } else {
    ok('iOS bundle identifier is configured');
  }

  if (!expo?.android?.package) {
    fail('expo.android.package is missing in app.json');
  } else {
    ok('Android package is configured');
  }

  if (expo?.runtimeVersion?.policy !== 'appVersion') {
    fail('expo.runtimeVersion.policy should be set to appVersion');
  } else {
    ok('runtimeVersion policy is appVersion');
  }

  if (!easJson?.build?.production) {
    fail('eas.json build.production profile is missing');
  } else {
    ok('EAS production profile exists');
  }

  const requiredScripts = [
    'build:production:ios',
    'build:production:android',
    'submit:production:ios',
    'submit:production:android'
  ];

  for (const scriptName of requiredScripts) {
    if (!packageJson?.scripts?.[scriptName]) {
      fail(`package.json script missing: ${scriptName}`);
    }
  }

  if (requiredScripts.every((s) => packageJson?.scripts?.[s])) {
    ok('Required release scripts exist');
  }

  const requiredEnv = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_KEY'];
  for (const envName of requiredEnv) {
    if (!hasEnvKey(envName)) {
      fail(`Missing env value for ${envName} (set in process env or .env.local)`);
    }
  }

  if (requiredEnv.every((name) => hasEnvKey(name))) {
    ok('Required public env vars are present');
  }

  if (process.exitCode && process.exitCode !== 0) {
    console.error('\nRelease guard failed. Fix items above before building.');
    process.exit(process.exitCode);
  }

  console.log('\n🚀 Release guard passed. Ready for production build.');
}

main();
