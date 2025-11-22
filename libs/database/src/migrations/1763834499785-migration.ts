import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763834499785 implements MigrationInterface {
  name = 'Migration1763834499785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum" AS ENUM('CUSTOMER_SERVICE', 'OFFICE_SUPPLIES', 'UTILITIES', 'MAINTENANCE', 'MARKETING', 'TRANSPORTATION', 'MISCELLANEOUS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "category" "public"."expenses_category_enum", "expenseDate" date NOT NULL, "notes" text, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c695f302eff568d4f0eda62a9" ON "expenses" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0766d954bebc0beddd85a1e7b7" ON "expenses" ("expenseDate", "category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d211de716f0f14ea7a8a4b1f2" ON "expenses" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e069bf5f4d4aaab62a84f24ca4" ON "expenses" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f52fb01c27607bb74ba05abf16" ON "expenses" ("expenseDate") `,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f52fb01c27607bb74ba05abf16"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e069bf5f4d4aaab62a84f24ca4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d211de716f0f14ea7a8a4b1f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0766d954bebc0beddd85a1e7b7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c695f302eff568d4f0eda62a9"`,
    );
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
  }
}
