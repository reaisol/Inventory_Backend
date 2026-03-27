import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcryptjs from 'bcryptjs';
import { Role, User } from '../libs/database/src/entities';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [__dirname + '/../libs/database/src/entities/**/*.entity{.ts,.js}'],
  ssl: process.env.DB_SSL === 'true' || process.env.DATABASE_URL?.includes('proxy.rlwy.net') ? { rejectUnauthorized: false } : false,
});

async function restoreSuperAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    // 1. Give the script a fixed admin profile 
    const email = 'emergency_admin@example.com';
    const password = 'SuperAdminRescue123!';
    const name = 'Emergency SuperAdmin';

    // 2. Locate the Super Admin role in the DB
    const superAdminRole = await roleRepo.findOne({ where: { name: 'super_admin' } });
    
    if (!superAdminRole) {
      console.error('CRITICAL: "super_admin" role not found in the database. Aborting recovery.');
      return;
    }

    // 3. Find existing user with this emergency email, or create a brand new user
    let user = await userRepo.findOne({ where: { email } });
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    if (user) {
      console.log(`User ${email} already exists. Updating password and forcing super_admin role...`);
      user.password = hashedPassword;
      user.roles = [superAdminRole];
      await userRepo.save(user);
    } else {
      console.log(`Creating new Emergency SuperAdmin user: ${email}`);
      user = userRepo.create({
        email,
        password: hashedPassword,
        name,
        roles: [superAdminRole],
      });
      await userRepo.save(user);
    }
    
    console.log('\n✅ SuperAdmin access restored successfully!');
    console.log('You can now log in to the /auth/login endpoint with:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error recovering admin user:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

restoreSuperAdmin();
