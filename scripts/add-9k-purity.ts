import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    console.log('Inserting 9K Gold purity if it does not exist...');
    
    // Using raw SQL query to insert
    const result = await AppDataSource.query(`
      INSERT INTO metal_purities (name, code, "purityPercentage", "metalTypeId")
      SELECT '9K', '9K', 37.5, id FROM metal_types WHERE code = 'GOLD'
      AND NOT EXISTS (
        SELECT 1 FROM metal_purities WHERE code = '9K' 
        AND "metalTypeId" = (SELECT id FROM metal_types WHERE code = 'GOLD')
      );
    `);
    
    console.log('Insert script completed. Query result:', result);
    
  } catch (error) {
    console.error('Error in script:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

run();
