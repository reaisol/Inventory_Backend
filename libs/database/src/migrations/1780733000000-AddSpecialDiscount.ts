import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpecialDiscount1780733000000 implements MigrationInterface {
  name = 'AddSpecialDiscount1780733000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "specialDiscount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "specialDiscount"`,
    );
  }
}
