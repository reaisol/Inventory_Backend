import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765695213685 implements MigrationInterface {
    name = 'Migration1765695213685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_sheet_transactions" ("id" SERIAL NOT NULL, "dailySheetId" integer NOT NULL, "transactionDate" date NOT NULL, "description" text NOT NULL, "goldWeight" numeric(10,3) NOT NULL DEFAULT '0', "goldRate" numeric(10,2), "goldValue" numeric(10,2) NOT NULL DEFAULT '0', "silverWeight" numeric(10,3) NOT NULL DEFAULT '0', "silverRate" numeric(10,2), "silverValue" numeric(10,2) NOT NULL DEFAULT '0', "makingCharges" numeric(10,2) NOT NULL DEFAULT '0', "oldGoldWeight" numeric(10,3) NOT NULL DEFAULT '0', "oldGoldValue" numeric(10,2) NOT NULL DEFAULT '0', "oldSilverWeight" numeric(10,3) NOT NULL DEFAULT '0', "oldSilverValue" numeric(10,2) NOT NULL DEFAULT '0', "grandTotal" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL DEFAULT '0', "cashAmount" numeric(10,2) NOT NULL DEFAULT '0', "onlineAmount" numeric(10,2) NOT NULL DEFAULT '0', "orderId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_14fe8b42595b1211b1b52a88637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6fec8d81369fbdb1728e451dff" ON "daily_sheet_transactions" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_2d3522353615c16200ac97281b" ON "daily_sheet_transactions" ("dailySheetId", "orderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_269073d24a1e371dc27fb3e51d" ON "daily_sheet_transactions" ("orderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4624d1b10a68cb22f3b3bdb82f" ON "daily_sheet_transactions" ("dailySheetId") `);
        await queryRunner.query(`CREATE TABLE "daily_sheet_expenses" ("id" SERIAL NOT NULL, "dailySheetId" integer NOT NULL, "description" text NOT NULL, "amount" numeric(10,2) NOT NULL, "expenseId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57f3f9c9e757b2f2f6bfe4da817" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3033ff70da7b4d5fdad086c96" ON "daily_sheet_expenses" ("dailySheetId", "expenseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c488d7c7386fa05e3477ba9098" ON "daily_sheet_expenses" ("expenseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_db2bd82a0a2f1e210f9c4ed3da" ON "daily_sheet_expenses" ("dailySheetId") `);
        await queryRunner.query(`CREATE TABLE "daily_sheets" ("id" SERIAL NOT NULL, "date" date NOT NULL, "openingGoldWeight" numeric(10,3) NOT NULL DEFAULT '0', "openingGoldValue" numeric(10,2) NOT NULL DEFAULT '0', "openingSilverWeight" numeric(10,3) NOT NULL DEFAULT '0', "openingSilverValue" numeric(10,2) NOT NULL DEFAULT '0', "openingCash" numeric(10,2) NOT NULL DEFAULT '0', "openingOnline" numeric(10,2) NOT NULL DEFAULT '0', "openingBalanceAutoCalculated" boolean NOT NULL DEFAULT true, "closingGoldWeight" numeric(10,3) NOT NULL DEFAULT '0', "closingGoldValue" numeric(10,2) NOT NULL DEFAULT '0', "closingSilverWeight" numeric(10,3) NOT NULL DEFAULT '0', "closingSilverValue" numeric(10,2) NOT NULL DEFAULT '0', "closingCash" numeric(10,2) NOT NULL DEFAULT '0', "closingOnline" numeric(10,2) NOT NULL DEFAULT '0', "closingBalanceAutoCalculated" boolean NOT NULL DEFAULT true, "closingGoldWeightManual" numeric(10,3), "closingGoldValueManual" numeric(10,2), "closingSilverWeightManual" numeric(10,3), "closingSilverValueManual" numeric(10,2), "closingCashManual" numeric(10,2), "closingOnlineManual" numeric(10,2), "notes" text, "isLocked" boolean NOT NULL DEFAULT false, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e9928857b1b5f8e8d4f121dd045" UNIQUE ("date"), CONSTRAINT "PK_8040e13ea824093c030c6e5124f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_54e8609adab3df854ac9b9f08b" ON "daily_sheets" ("isLocked") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f2e993a8ef8d768f2585020ae" ON "daily_sheets" ("createdAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e9928857b1b5f8e8d4f121dd04" ON "daily_sheets" ("date") `);
        await queryRunner.query(`CREATE TYPE "public"."finance_entries_type_enum" AS ENUM('IN', 'OUT')`);
        await queryRunner.query(`CREATE TABLE "finance_entries" ("id" SERIAL NOT NULL, "dailySheetId" integer NOT NULL, "type" "public"."finance_entries_type_enum" NOT NULL, "description" text NOT NULL, "amount" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_550c7243f4fb3952224a6a7616d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_67b8d56ee1b91670193b13be0a" ON "finance_entries" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_166835bdeb24a43a5baf83031b" ON "finance_entries" ("dailySheetId", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_b067648fba7baa364a369d2489" ON "finance_entries" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a74b927bca58b4801d59eeebf" ON "finance_entries" ("dailySheetId") `);
        await queryRunner.query(`ALTER TABLE "daily_sheet_transactions" ADD CONSTRAINT "FK_4624d1b10a68cb22f3b3bdb82fc" FOREIGN KEY ("dailySheetId") REFERENCES "daily_sheets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_transactions" ADD CONSTRAINT "FK_269073d24a1e371dc27fb3e51db" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_expenses" ADD CONSTRAINT "FK_db2bd82a0a2f1e210f9c4ed3dac" FOREIGN KEY ("dailySheetId") REFERENCES "daily_sheets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_expenses" ADD CONSTRAINT "FK_c488d7c7386fa05e3477ba90988" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_sheets" ADD CONSTRAINT "FK_8a5684033b50bc4b30d7fe25971" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "finance_entries" ADD CONSTRAINT "FK_3a74b927bca58b4801d59eeebf3" FOREIGN KEY ("dailySheetId") REFERENCES "daily_sheets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "finance_entries" DROP CONSTRAINT "FK_3a74b927bca58b4801d59eeebf3"`);
        await queryRunner.query(`ALTER TABLE "daily_sheets" DROP CONSTRAINT "FK_8a5684033b50bc4b30d7fe25971"`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_expenses" DROP CONSTRAINT "FK_c488d7c7386fa05e3477ba90988"`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_expenses" DROP CONSTRAINT "FK_db2bd82a0a2f1e210f9c4ed3dac"`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_transactions" DROP CONSTRAINT "FK_269073d24a1e371dc27fb3e51db"`);
        await queryRunner.query(`ALTER TABLE "daily_sheet_transactions" DROP CONSTRAINT "FK_4624d1b10a68cb22f3b3bdb82fc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a74b927bca58b4801d59eeebf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b067648fba7baa364a369d2489"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_166835bdeb24a43a5baf83031b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_67b8d56ee1b91670193b13be0a"`);
        await queryRunner.query(`DROP TABLE "finance_entries"`);
        await queryRunner.query(`DROP TYPE "public"."finance_entries_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9928857b1b5f8e8d4f121dd04"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f2e993a8ef8d768f2585020ae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54e8609adab3df854ac9b9f08b"`);
        await queryRunner.query(`DROP TABLE "daily_sheets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db2bd82a0a2f1e210f9c4ed3da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c488d7c7386fa05e3477ba9098"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3033ff70da7b4d5fdad086c96"`);
        await queryRunner.query(`DROP TABLE "daily_sheet_expenses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4624d1b10a68cb22f3b3bdb82f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_269073d24a1e371dc27fb3e51d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d3522353615c16200ac97281b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fec8d81369fbdb1728e451dff"`);
        await queryRunner.query(`DROP TABLE "daily_sheet_transactions"`);
    }

}
