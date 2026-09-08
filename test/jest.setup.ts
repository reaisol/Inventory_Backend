// Test-only placeholder keys prevent module initialization from depending on
// developer or production environment files.
process.env.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || 'test-private-key';
process.env.JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY || 'test-public-key';
