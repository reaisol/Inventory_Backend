const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at', envPath);
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function esc(s) {
  return s.replace(/\r?\n/g, '\\n');
}

const privLine = 'JWT_PRIVATE_KEY="' + esc(privateKey) + '"';
const pubLine = 'JWT_PUBLIC_KEY="' + esc(publicKey) + '"';

let env = fs.readFileSync(envPath, 'utf8');

if (/^JWT_PRIVATE_KEY=/m.test(env)) {
  env = env.replace(/^JWT_PRIVATE_KEY=.*$/m, privLine);
} else {
  env += '\n' + privLine + '\n';
}

if (/^JWT_PUBLIC_KEY=/m.test(env)) {
  env = env.replace(/^JWT_PUBLIC_KEY=.*$/m, pubLine);
} else {
  env += '\n' + pubLine + '\n';
}

fs.writeFileSync(envPath, env, 'utf8');
console.log('Updated .env with generated JWT keys');
