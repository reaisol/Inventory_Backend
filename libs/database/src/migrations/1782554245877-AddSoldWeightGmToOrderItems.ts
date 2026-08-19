import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoldWeightGmToOrderItems1782554245877
  implements MigrationInterface
{
  name = 'AddSoldWeightGmToOrderItems1782554245877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "soldWeightGm" numeric(10,3)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "soldWeightGm"`,
    );
  }
}
