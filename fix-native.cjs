const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nm = path.join(__dirname, 'node_modules');
const tmpDir = path.join(require('os').tmpdir(), 'native-pkgs');
fs.mkdirSync(tmpDir, { recursive: true });

function hasFiles(dir) {
  try {
    return fs.existsSync(dir) && fs.readdirSync(dir).filter(f => !f.startsWith('.')).length > 0;
  } catch {
    return false;
  }
}

const toInstall = new Set();

function checkPkg(pkgDir) {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    const optDeps = pkgJson.optionalDependencies || {};
    for (const [name, version] of Object.entries(optDeps)) {
      if (name.includes('win32-x64-msvc')) {
        const dirName = name.startsWith('@') ? name : name;
        const pkgPath = path.join(nm, ...dirName.split('/'));
        if (!hasFiles(pkgPath)) {
          toInstall.add(`${name}@${version}`);
        }
      }
    }
  } catch {}
}

// Check top-level packages
for (const entry of fs.readdirSync(nm, { withFileTypes: true })) {
  if (entry.isDirectory() && !entry.name.startsWith('@')) {
    checkPkg(path.join(nm, entry.name));
  }
}

// Check scoped packages
for (const entry of fs.readdirSync(nm, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith('@')) {
    const scopeDir = path.join(nm, entry.name);
    for (const sub of fs.readdirSync(scopeDir, { withFileTypes: true })) {
      if (sub.isDirectory()) {
        checkPkg(path.join(scopeDir, sub.name));
      }
    }
  }
}

const packages = [...toInstall];
console.log('Packages to install:', packages);

for (const pkg of packages) {
  const pkgName = pkg.split('@').slice(0, -1).join('@');
  const version = pkg.split('@').slice(-1)[0];

  console.log(`\nInstalling ${pkg}...`);

  // Pack the tarball
  try {
    execSync(`npm pack "${pkg}" --pack-destination "${tmpDir}"`, { stdio: 'pipe' });
  } catch (e) {
    console.error(`Failed to pack ${pkg}:`, e.message);
    continue;
  }

  // Find the tgz file
  const safeName = pkgName.replace('@', '').replace('/', '-');
  const tgzFile = path.join(tmpDir, `${safeName}-${version}.tgz`);

  if (!fs.existsSync(tgzFile)) {
    console.error(`Tgz not found at ${tgzFile}`);
    const files = fs.readdirSync(tmpDir);
    console.log('Available files:', files);
    continue;
  }

  // Create destination directory
  const destDir = path.join(nm, ...pkgName.split('/'));
  fs.mkdirSync(destDir, { recursive: true });

  // Extract
  try {
    execSync(`tar xzf "${tgzFile}" --strip-components=1 -C "${destDir}"`, { stdio: 'pipe' });
    console.log(`Successfully installed ${pkg} to ${destDir}`);
  } catch (e) {
    console.error(`Failed to extract ${pkg}:`, e.message);
  }
}

console.log('\nDone! All native packages installed.');
