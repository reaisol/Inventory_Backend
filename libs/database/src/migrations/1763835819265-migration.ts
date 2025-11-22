import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763835819265 implements MigrationInterface {
  name = 'Migration1763835819265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "quantity" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "isBulkItem" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "totalQuantity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "remainingQuantity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "weightPerItem" numeric(10,3)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "weightPerItem"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "remainingQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "totalQuantity"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isBulkItem"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "quantity"`);
  }
}
