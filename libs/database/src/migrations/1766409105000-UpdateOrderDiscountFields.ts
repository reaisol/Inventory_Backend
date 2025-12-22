import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderDiscountFields1766409105000 implements MigrationInterface {
  name = 'UpdateOrderDiscountFields1766409105000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new discount fields
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "makingDiscount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "wastageDiscount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );

    // Migrate existing discountAmount to makingDiscount (if any)
    // Note: This is a one-time migration. Old discountAmount will be lost if not migrated properly.
    // You may want to review existing orders and manually migrate if needed.
    await queryRunner.query(
      `UPDATE "orders" SET "makingDiscount" = "discountAmount" WHERE "discountAmount" > 0`,
    );

    // Drop old discountAmount column
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "discountAmount"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add old discountAmount column
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "discountAmount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );

    // Migrate back (combining both discounts into single field)
    await queryRunner.query(
      `UPDATE "orders" SET "discountAmount" = "makingDiscount" + "wastageDiscount"`,
    );

    // Drop new columns
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "wastageDiscount"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "makingDiscount"`);
  }
}

