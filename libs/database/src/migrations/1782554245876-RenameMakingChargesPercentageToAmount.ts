import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameMakingChargesPercentageToAmount1782554245876 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      // 1. Reset every existing value to 0, because old values represent percentages and are not meaningful as rupee amounts.
      await queryRunner.query(`UPDATE "products" SET "makingChargesPercentage" = 0`);

      // 2. Expand precision from (5,2) to (10,2) so flat rupee amounts fit.
      await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "makingChargesPercentage" TYPE numeric(10,2)`);

      // 3. Rename the column to reflect its new meaning.
      await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "makingChargesPercentage" TO "makingChargesAmount"`);

      // 4. Update the default.
      await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "makingChargesAmount" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "makingChargesAmount" SET DEFAULT 0`);
      await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "makingChargesAmount" TO "makingChargesPercentage"`);
      await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "makingChargesPercentage" TYPE numeric(5,2)`);
    }

}
