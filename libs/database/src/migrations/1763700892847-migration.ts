import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763700892847 implements MigrationInterface {
  name = 'Migration1763700892847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "users" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_75bdfcb56936b035bad1bbc666" ON "metal_prices" ("effectiveDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_998dccedefe5e111a38ec37f88" ON "metal_prices" ("metalPurityId", "isActive", "effectiveDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cf358083303634803f1dfb763" ON "customers" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88acd889fbe17d0e16cc4bc917" ON "customers" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b942d55b92ededa770041db9de" ON "customers" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5dc4f4cfd0b2c11447acab8352" ON "order_items" ("orderId", "productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f4b9818a08b822a31493fdee9" ON "orders" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bb4d149a101de4ffed07c165c" ON "orders" ("orderDate", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d1bdeb2d6376b6d1fb5d831c9" ON "exchanges" ("exchangeType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f38b5babe25d85a9d093006c1" ON "exchanges" ("orderId", "metalPurityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_67c88fb39ea8864882b7e39958" ON "metal_purities" ("metalTypeId", "code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_283fbc22bf84e2fbe587a06114" ON "metal_purities" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b154faf362ece90ed3c3cc52d6" ON "metal_purities" ("metalTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1b2a7db269357041e989015177" ON "metal_types" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9df70938b0201ea7e0895189dc" ON "metal_types" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_77d7eff8a7aaa05457a12b8007" ON "categories" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adfc4b424e28e79928459dd8fc" ON "product_stocks" ("productId", "stockType", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_41d36ec2c5f59f10703e4c36a3" ON "product_stocks" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ecfef6121eb2d05e87a41bbf5a" ON "product_stocks" ("stockType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e5755d032c1551a16f4393cd9" ON "product_stocks" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63fcb3d8806a6efd53dbc67430" ON "products" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58075ba759b7738eb2eac5a9af" ON "products" ("status", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44882fc7923eb723185d390617" ON "products" ("metalPurityId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44882fc7923eb723185d390617"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58075ba759b7738eb2eac5a9af"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63fcb3d8806a6efd53dbc67430"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e5755d032c1551a16f4393cd9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ecfef6121eb2d05e87a41bbf5a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_41d36ec2c5f59f10703e4c36a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_adfc4b424e28e79928459dd8fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77d7eff8a7aaa05457a12b8007"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9df70938b0201ea7e0895189dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1b2a7db269357041e989015177"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b154faf362ece90ed3c3cc52d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_283fbc22bf84e2fbe587a06114"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67c88fb39ea8864882b7e39958"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f38b5babe25d85a9d093006c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d1bdeb2d6376b6d1fb5d831c9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bb4d149a101de4ffed07c165c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f4b9818a08b822a31493fdee9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5dc4f4cfd0b2c11447acab8352"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b942d55b92ededa770041db9de"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88acd889fbe17d0e16cc4bc917"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2cf358083303634803f1dfb763"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_998dccedefe5e111a38ec37f88"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_75bdfcb56936b035bad1bbc666"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51b8b26ac168fbe7d6f5653e6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_204e9b624861ff4a5b26819210"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"`,
    );
  }
}
