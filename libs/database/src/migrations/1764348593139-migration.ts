import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764348593139 implements MigrationInterface {
  name = 'Migration1764348593139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exchanges" ADD "customPurityName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" ADD "customPurityPercentage" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" DROP CONSTRAINT "FK_1cb2a5372b476e27cae163b6435"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f38b5babe25d85a9d093006c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" ALTER COLUMN "metalPurityId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f38b5babe25d85a9d093006c1" ON "exchanges" ("orderId", "metalPurityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" ADD CONSTRAINT "FK_1cb2a5372b476e27cae163b6435" FOREIGN KEY ("metalPurityId") REFERENCES "metal_purities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exchanges" DROP CONSTRAINT "FK_1cb2a5372b476e27cae163b6435"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f38b5babe25d85a9d093006c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" ALTER COLUMN "metalPurityId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f38b5babe25d85a9d093006c1" ON "exchanges" ("orderId", "metalPurityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" ADD CONSTRAINT "FK_1cb2a5372b476e27cae163b6435" FOREIGN KEY ("metalPurityId") REFERENCES "metal_purities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" DROP COLUMN "customPurityPercentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchanges" DROP COLUMN "customPurityName"`,
    );
  }
}
