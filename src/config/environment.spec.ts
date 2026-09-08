import {
  getAllowedCorsOrigins,
  isSwaggerEnabled,
  validateEnvironment,
} from './environment';

const productionEnvironment = {
  NODE_ENV: 'production',
  DB_HOST: 'db.example.test',
  DB_PORT: '5432',
  DB_USERNAME: 'user',
  DB_PASSWORD: 'password',
  DB_NAME: 'inventory',
  DB_SSL: 'true',
  JWT_PRIVATE_KEY: 'private-key',
  JWT_PUBLIC_KEY: 'public-key',
  S3_AWS_ACCESS_KEY_ID: 'access-key',
  S3_AWS_SECRET_ACCESS_KEY: 'secret-key',
  S3_AWS_BUCKET_REGION: 'region',
  S3_AWS_API_URL: 'https://storage.example.test',
  S3_AWS_PRIVATE_BUCKET_NAME: 'private-bucket',
  AWS_S3_BUCKET_PUBLIC_NAME: 'public-bucket',
  CORS_ORIGIN: 'https://app.example.test',
};

describe('environment configuration', () => {
  it('rejects incomplete production configuration without exposing values', () => {
    expect(() =>
      validateEnvironment({ ...productionEnvironment, DB_PASSWORD: '' }),
    ).toThrow('DB_PASSWORD');
  });

  it('parses explicitly configured CORS origins', () => {
    expect(
      getAllowedCorsOrigins({
        CORS_ORIGIN: 'https://app.example.test, http://localhost:5173 ',
      }),
    ).toEqual(['https://app.example.test', 'http://localhost:5173']);
  });

  it('uses safe local development origins when none are configured', () => {
    expect(getAllowedCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:5173',
    );
  });

  it('keeps Swagger disabled in production unless explicitly enabled', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(
      isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }),
    ).toBe(true);
  });
});
