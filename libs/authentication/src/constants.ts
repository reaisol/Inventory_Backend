import * as dotenv from 'dotenv';

dotenv.config();

export const JWT_CONSTANTS = {
  // These are default values. In production, these should be set via environment variables
  privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
  expiresIn: '1d', // 1 day
  refreshExpiresIn: '7d', // 7 days
};

export const CHECK_POLICIES_KEY = 'check_policies';
