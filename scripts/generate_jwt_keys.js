const { generateKeyPairSync } = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function esc(s) {
  return s.replace(/\r?\n/g, '\\n');
}

console.log('JWT_PRIVATE_KEY="' + esc(privateKey) + '"');
console.log('JWT_PUBLIC_KEY="' + esc(publicKey) + '"');
