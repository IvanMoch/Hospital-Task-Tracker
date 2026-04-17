import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://user:password@localhost:5432/waok_db',
    DB_USER: 'user',
    DB_PASSWORD: 'password',
    DB_NAME: 'waok_db',
    PORT: '3000',
    NODE_ENV: 'test',
  };

  it('should parse a valid environment config', () => {
    expect(validateEnv(validEnv)).toEqual({
      ...validEnv,
      PORT: 3000,
    });
  });

  it('should apply defaults when optional values are omitted', () => {
    expect(
      validateEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        DB_USER: validEnv.DB_USER,
        DB_PASSWORD: validEnv.DB_PASSWORD,
        DB_NAME: validEnv.DB_NAME,
      }),
    ).toEqual({
      DATABASE_URL: validEnv.DATABASE_URL,
      DB_USER: validEnv.DB_USER,
      DB_PASSWORD: validEnv.DB_PASSWORD,
      DB_NAME: validEnv.DB_NAME,
      PORT: 3000,
      NODE_ENV: 'development',
    });
  });

  it('should throw for invalid PostgreSQL URLs', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        DATABASE_URL: 'mysql://localhost/db',
      }),
    ).toThrow('Must be a valid PostgreSQL connection string');
  });
});
