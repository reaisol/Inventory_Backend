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
