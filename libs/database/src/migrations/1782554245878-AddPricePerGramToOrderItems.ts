import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPricePerGramToOrderItems1782554245878
  implements MigrationInterface
{
  name = 'AddPricePerGramToOrderItems1782554245878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "pricePerGram" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "pricePerGram"`,
    );
  }
}
