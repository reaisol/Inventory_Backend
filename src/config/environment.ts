type Environment = Record<string, string | undefined>;

const requiredProductionVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_SSL',
  'JWT_PRIVATE_KEY',
  'JWT_PUBLIC_KEY',
  'S3_AWS_ACCESS_KEY_ID',
  'S3_AWS_SECRET_ACCESS_KEY',
  'S3_AWS_BUCKET_REGION',
  'S3_AWS_API_URL',
  'S3_AWS_PRIVATE_BUCKET_NAME',
  'AWS_S3_BUCKET_PUBLIC_NAME',
  'CORS_ORIGIN',
] as const;

const localDevelopmentOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];

function isPositiveInteger(value: string | undefined): boolean {
  return !!value && Number.isInteger(Number(value)) && Number(value) > 0;
}

function isBoolean(value: string | undefined): boolean {
  return value === undefined || ['true', 'false'].includes(value.toLowerCase());
}

export function validateEnvironment(config: Environment): Environment {
  const isProduction = config.NODE_ENV === 'production';

  if (isProduction) {
    const missing = requiredProductionVariables.filter(
      (name) => !config[name]?.trim(),
    );

    if (missing.length > 0) {
      throw new Error(
        `Invalid production configuration: missing required variables: ${missing.join(', ')}`,
      );
    }
  }

  const numericVariables = [
    'PORT',
    'DB_PORT',
    'THROTTLE_TTL',
    'THROTTLE_LIMIT',
  ];
  const invalidNumericVariables = numericVariables.filter(
    (name) => config[name] !== undefined && !isPositiveInteger(config[name]),
  );
  if (invalidNumericVariables.length > 0) {
    throw new Error(
      `Invalid configuration: expected positive integers for: ${invalidNumericVariables.join(', ')}`,
    );
  }

  const invalidBooleanVariables = ['DB_SSL', 'SWAGGER_ENABLED'].filter(
    (name) => !isBoolean(config[name]),
  );
  if (invalidBooleanVariables.length > 0) {
    throw new Error(
      `Invalid configuration: expected true or false for: ${invalidBooleanVariables.join(', ')}`,
    );
  }

  return config;
}

export function getAllowedCorsOrigins(config: Environment): string[] {
  const configuredOrigins = config.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return config.NODE_ENV === 'production' ? [] : localDevelopmentOrigins;
}

export function isSwaggerEnabled(config: Environment): boolean {
  if (config.SWAGGER_ENABLED !== undefined) {
    return config.SWAGGER_ENABLED.toLowerCase() === 'true';
  }

  return config.NODE_ENV !== 'production';
}
