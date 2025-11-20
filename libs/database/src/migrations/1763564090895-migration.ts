import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763564090895 implements MigrationInterface {
    name = 'Migration1763564090895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "value" text NOT NULL, "description" text, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b1b5bc664526d375c94ce9ad43d" UNIQUE ("key"), CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b1b5bc664526d375c94ce9ad43" ON "system_settings" ("key") `);
        await queryRunner.query(`CREATE TABLE "metal_prices" ("id" SERIAL NOT NULL, "metalPurityId" integer NOT NULL, "pricePerGram" numeric(10,2) NOT NULL, "effectiveDate" date NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_107947b8bbeb2548d5f177538ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f68599532b9fc19d3e80fc3b99" ON "metal_prices" ("isActive", "effectiveDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_4b27bbe2f580aa69982612227b" ON "metal_prices" ("metalPurityId", "effectiveDate") `);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying, "phone" character varying, "address" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8c2b8191ed9b407c269b978254" ON "customers" ("email") WHERE email IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "productId" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cdb99c05982d5191ac8465ac01" ON "order_items" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f1d359a55923bb45b057fbdab0" ON "order_items" ("orderId") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('CASH', 'CARD', 'UPI', 'CHEQUE', 'MIXED')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "orderNumber" character varying NOT NULL, "customerId" integer, "userId" integer NOT NULL, "orderDate" TIMESTAMP NOT NULL DEFAULT now(), "subtotal" numeric(10,2) NOT NULL, "exchangeCredit" numeric(10,2) NOT NULL DEFAULT '0', "wastageAmount" numeric(10,2) NOT NULL DEFAULT '0', "makingChargesAmount" numeric(10,2) NOT NULL DEFAULT '0', "discountAmount" numeric(10,2) NOT NULL DEFAULT '0', "totalAmount" numeric(10,2) NOT NULL, "paymentMethod" "public"."orders_paymentmethod_enum" NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e5de51ca888d8b1f5ac25799dd" ON "orders" ("customerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_a1bb11e2ea78aa609b5cb3127c" ON "orders" ("orderDate") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_59b0c3b34ea0fa5562342f2414" ON "orders" ("orderNumber") `);
        await queryRunner.query(`CREATE TYPE "public"."exchanges_exchangetype_enum" AS ENUM('GOLD', 'SILVER')`);
        await queryRunner.query(`CREATE TABLE "exchanges" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "exchangeType" "public"."exchanges_exchangetype_enum" NOT NULL, "metalPurityId" integer NOT NULL, "weightGm" numeric(10,3) NOT NULL, "pricePerGram" numeric(10,2) NOT NULL, "totalCredit" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_17ccd29473f939c68de98c2cea3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1cb2a5372b476e27cae163b643" ON "exchanges" ("metalPurityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_69c86ad5d1ff1dbc6af7cce4f8" ON "exchanges" ("orderId") `);
        await queryRunner.query(`CREATE TABLE "metal_purities" ("id" SERIAL NOT NULL, "metalTypeId" integer NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "purityPercentage" numeric(5,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eab053b77d10abe3a2ea8d757f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "metal_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1b2a7db269357041e9890151774" UNIQUE ("name"), CONSTRAINT "UQ_9df70938b0201ea7e0895189dc6" UNIQUE ("code"), CONSTRAINT "PK_e5f875481b959441c913a123978" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_77d7eff8a7aaa05457a12b8007a" UNIQUE ("code"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_stocks_stocktype_enum" AS ENUM('IN', 'OUT', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "product_stocks" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "stockType" "public"."product_stocks_stocktype_enum" NOT NULL, "referenceType" character varying NOT NULL, "referenceId" integer, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e6eefa449c5773c5fe43ab113d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_658c81455fbaef8fd784ab10e9" ON "product_stocks" ("referenceType", "referenceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a586c2a17230b916ede0517126" ON "product_stocks" ("productId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK', 'SOLD')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "productId" character varying NOT NULL, "name" character varying NOT NULL, "metalTypeId" integer NOT NULL, "metalPurityId" integer NOT NULL, "categoryId" integer NOT NULL, "grossWeightGm" numeric(10,3) NOT NULL, "grossWeightCt" numeric(10,3), "stoneWeightGm" numeric(10,3), "stoneWeightCt" numeric(10,3), "stoneCost" numeric(10,2) DEFAULT '0', "wastagePercentage" numeric(5,2) NOT NULL DEFAULT '5', "makingChargesPercentage" numeric(5,2) NOT NULL DEFAULT '15', "barcode" character varying, "status" "public"."products_status_enum" NOT NULL DEFAULT 'IN_STOCK', "additionalNotes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7b3b507508cd0f86a5b2e923459" UNIQUE ("productId"), CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE ("barcode"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e276f3fc99838783bc52182e0f" ON "products" ("metalTypeId", "categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1846199852a695713b1f8f5e9a" ON "products" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_66f8d4eb79094ca848de5be70e" ON "products" ("barcode") WHERE barcode IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7b3b507508cd0f86a5b2e92345" ON "products" ("productId") `);
        await queryRunner.query(`ALTER TABLE "metal_prices" ADD CONSTRAINT "FK_7746a933eea92234acc410052c6" FOREIGN KEY ("metalPurityId") REFERENCES "metal_purities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exchanges" ADD CONSTRAINT "FK_69c86ad5d1ff1dbc6af7cce4f88" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exchanges" ADD CONSTRAINT "FK_1cb2a5372b476e27cae163b6435" FOREIGN KEY ("metalPurityId") REFERENCES "metal_purities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "metal_purities" ADD CONSTRAINT "FK_b154faf362ece90ed3c3cc52d6f" FOREIGN KEY ("metalTypeId") REFERENCES "metal_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_stocks" ADD CONSTRAINT "FK_5e5755d032c1551a16f4393cd9d" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ccf8075349eeec0b616e58b9397" FOREIGN KEY ("metalTypeId") REFERENCES "metal_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_44882fc7923eb723185d390617a" FOREIGN KEY ("metalPurityId") REFERENCES "metal_purities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_44882fc7923eb723185d390617a"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ccf8075349eeec0b616e58b9397"`);
        await queryRunner.query(`ALTER TABLE "product_stocks" DROP CONSTRAINT "FK_5e5755d032c1551a16f4393cd9d"`);
        await queryRunner.query(`ALTER TABLE "metal_purities" DROP CONSTRAINT "FK_b154faf362ece90ed3c3cc52d6f"`);
        await queryRunner.query(`ALTER TABLE "exchanges" DROP CONSTRAINT "FK_1cb2a5372b476e27cae163b6435"`);
        await queryRunner.query(`ALTER TABLE "exchanges" DROP CONSTRAINT "FK_69c86ad5d1ff1dbc6af7cce4f88"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "metal_prices" DROP CONSTRAINT "FK_7746a933eea92234acc410052c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b3b507508cd0f86a5b2e92345"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66f8d4eb79094ca848de5be70e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1846199852a695713b1f8f5e9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e276f3fc99838783bc52182e0f"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a586c2a17230b916ede0517126"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_658c81455fbaef8fd784ab10e9"`);
        await queryRunner.query(`DROP TABLE "product_stocks"`);
        await queryRunner.query(`DROP TYPE "public"."product_stocks_stocktype_enum"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "metal_types"`);
        await queryRunner.query(`DROP TABLE "metal_purities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69c86ad5d1ff1dbc6af7cce4f8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cb2a5372b476e27cae163b643"`);
        await queryRunner.query(`DROP TABLE "exchanges"`);
        await queryRunner.query(`DROP TYPE "public"."exchanges_exchangetype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59b0c3b34ea0fa5562342f2414"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1bb11e2ea78aa609b5cb3127c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5de51ca888d8b1f5ac25799dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_151b79a83ba240b0cb31b2302d"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1d359a55923bb45b057fbdab0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdb99c05982d5191ac8465ac01"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8c2b8191ed9b407c269b978254"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b27bbe2f580aa69982612227b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f68599532b9fc19d3e80fc3b99"`);
        await queryRunner.query(`DROP TABLE "metal_prices"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b1b5bc664526d375c94ce9ad43"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
    }

}
