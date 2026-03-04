import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766407379608 implements MigrationInterface {
  name = 'Migration1766407379608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventorySentOutGoldWeight" numeric(10,3) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventorySentOutGoldValue" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventorySentOutSilverWeight" numeric(10,3) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventorySentOutSilverValue" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventoryReceivedGoldWeight" numeric(10,3) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventoryReceivedGoldValue" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventoryReceivedSilverWeight" numeric(10,3) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" ADD "oldInventoryReceivedSilverValue" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventoryReceivedSilverValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventoryReceivedSilverWeight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventoryReceivedGoldValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventoryReceivedGoldWeight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventorySentOutSilverValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventorySentOutSilverWeight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventorySentOutGoldValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_sheets" DROP COLUMN "oldInventorySentOutGoldWeight"`,
    );
  }
}
