import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  MetalType,
  MetalPurity,
  Category,
  SystemSettings,
  Role,
} from '../libs/database/src/entities';
import { PERMISSIONS } from '../libs/authentication/src/permissions';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [__dirname + '/../libs/database/src/entities/**/*.entity{.ts,.js}'],
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const metalTypeRepo = AppDataSource.getRepository(MetalType);
    const metalPurityRepo = AppDataSource.getRepository(MetalPurity);
    const categoryRepo = AppDataSource.getRepository(Category);
    const settingsRepo = AppDataSource.getRepository(SystemSettings);
    const roleRepo = AppDataSource.getRepository(Role);

    // Seed Metal Types
    console.log('Seeding Metal Types...');
    let goldType = await metalTypeRepo.findOne({ where: { code: 'GOLD' } });
    if (!goldType) {
      goldType = metalTypeRepo.create({
        name: 'Gold',
        code: 'GOLD',
      });
      goldType = await metalTypeRepo.save(goldType);
      console.log('✓ Gold type created');
    } else {
      console.log('✓ Gold type already exists');
    }

    let silverType = await metalTypeRepo.findOne({ where: { code: 'SILVER' } });
    if (!silverType) {
      silverType = metalTypeRepo.create({
        name: 'Silver',
        code: 'SILVER',
      });
      silverType = await metalTypeRepo.save(silverType);
      console.log('✓ Silver type created');
    } else {
      console.log('✓ Silver type already exists');
    }

    // Seed Metal Purities
    console.log('Seeding Metal Purities...');
    const goldPurities = [
      { name: '24K', code: '24K', purityPercentage: 99.9 },
      { name: '22K', code: '22K', purityPercentage: 91.6 },
      { name: '18K', code: '18K', purityPercentage: 75.0 },
    ];

    for (const purity of goldPurities) {
      let existing = await metalPurityRepo.findOne({
        where: { code: purity.code, metalTypeId: goldType.id },
      });
      if (!existing) {
        await metalPurityRepo.save({
          ...purity,
          metalTypeId: goldType.id,
        });
        console.log(`✓ ${purity.name} Gold purity created`);
      } else {
        console.log(`✓ ${purity.name} Gold purity already exists`);
      }
    }

    const silverPurities = [
      { name: 'Fine Silver', code: 'FINE', purityPercentage: 99.9 },
      { name: 'Sterling Silver', code: 'STERLING', purityPercentage: 92.5 },
    ];

    for (const purity of silverPurities) {
      let existing = await metalPurityRepo.findOne({
        where: { code: purity.code, metalTypeId: silverType.id },
      });
      if (!existing) {
        await metalPurityRepo.save({
          ...purity,
          metalTypeId: silverType.id,
        });
        console.log(`✓ ${purity.name} purity created`);
      } else {
        console.log(`✓ ${purity.name} purity already exists`);
      }
    }

    // Seed Categories
    console.log('Seeding Categories...');
    const categories = [
      { name: 'Necklace', code: 'NECKLACE' },
      { name: 'Bracelet', code: 'BRACELET' },
      { name: 'Earrings', code: 'EARRINGS' },
      { name: 'Rings', code: 'RINGS' },
      { name: 'Bangles', code: 'BANGLES' },
      { name: 'Chain', code: 'CHAIN' },
      { name: 'Pendant', code: 'PENDANT' },
      { name: 'Choker', code: 'CHOKER' },
    ];

    for (const category of categories) {
      let existing = await categoryRepo.findOne({
        where: { code: category.code },
      });
      if (!existing) {
        await categoryRepo.save(category);
        console.log(`✓ ${category.name} category created`);
      } else {
        console.log(`✓ ${category.name} category already exists`);
      }
    }

    // Seed System Settings
    console.log('Seeding System Settings...');
    const settings = [
      {
        key: 'LOW_STOCK_THRESHOLD',
        value: '2',
        description: 'Fixed threshold for low stock alert (number of items)',
      },
      {
        key: 'DEFAULT_WASTAGE_PERCENTAGE',
        value: '5.0',
        description: 'Default wastage percentage for products',
      },
      {
        key: 'DEFAULT_MAKING_CHARGES_PERCENTAGE',
        value: '15.0',
        description: 'Default making charges percentage for products',
      },
    ];

    for (const setting of settings) {
      let existing = await settingsRepo.findOne({
        where: { key: setting.key },
      });
      if (!existing) {
        await settingsRepo.save(setting);
        console.log(`✓ ${setting.key} setting created`);
      } else {
        console.log(`✓ ${setting.key} setting already exists`);
      }
    }

    // Seed Default Roles
    console.log('Seeding Default Roles...');
    const allPermissions = Object.keys(PERMISSIONS);

    // Super Admin - Full system access
    let superAdmin = await roleRepo.findOne({ where: { name: 'super_admin' } });
    if (!superAdmin) {
      superAdmin = roleRepo.create({
        name: 'super_admin',
        permissions: allPermissions,
      });
      superAdmin = await roleRepo.save(superAdmin);
      console.log('✓ Super Admin role created with all permissions');
    } else {
      console.log('✓ Super Admin role already exists');
    }

    // Inventory Manager - Can manage products
    let inventoryManager = await roleRepo.findOne({
      where: { name: 'inventory_manager' },
    });
    if (!inventoryManager) {
      inventoryManager = roleRepo.create({
        name: 'inventory_manager',
        permissions: [
          // Metal permissions
          'read_metal_type',
          'read_metal_purity',
          'create_metal_price',
          'read_metal_price',
          'update_metal_price',
          // Category permissions
          'create_category',
          'read_category',
          'update_category',
          'delete_category',
          // Product permissions
          'create_product',
          'read_product',
          'update_product',
          'delete_product',
          'calculate_product_price',
          // Settings (read only for inventory settings)
          'read_setting',
        ],
      });
      inventoryManager = await roleRepo.save(inventoryManager);
      console.log('✓ Inventory Manager role created');
    } else {
      console.log('✓ Inventory Manager role already exists');
    }

    // Sales Manager - Can process sales
    let salesManager = await roleRepo.findOne({
      where: { name: 'sales_manager' },
    });
    if (!salesManager) {
      salesManager = roleRepo.create({
        name: 'sales_manager',
        permissions: [
          // Customer permissions
          'create_customer',
          'read_customer',
          'update_customer',
          // Product permissions (read only)
          'read_product',
          'calculate_product_price',
          // Order permissions
          'create_order',
          'read_order',
          // Metal permissions (read only for pricing)
          'read_metal_type',
          'read_metal_purity',
          'read_metal_price',
          // Category permissions (read only)
          'read_category',
        ],
      });
      salesManager = await roleRepo.save(salesManager);
      console.log('✓ Sales Manager role created');
    } else {
      console.log('✓ Sales Manager role already exists');
    }

    console.log('\n✅ Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seedData();
