import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_in_stock" AS ENUM('in_stock', 'preorder', 'out_of_stock');
  CREATE TYPE "public"."enum__products_v_version_in_stock" AS ENUM('in_stock', 'preorder', 'out_of_stock');
  CREATE TABLE "pages_blocks_categories_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Популярные категории',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_block_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_services_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Дополнительные услуги',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_categories_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Популярные категории',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_block_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Дополнительные услуги',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "products" ADD COLUMN "sku" varchar;
  ALTER TABLE "products" ADD COLUMN "in_stock" "enum_products_in_stock" DEFAULT 'in_stock';
  ALTER TABLE "products" ADD COLUMN "rating_value" numeric;
  ALTER TABLE "products" ADD COLUMN "rating_count" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_sku" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_in_stock" "enum__products_v_version_in_stock" DEFAULT 'in_stock';
  ALTER TABLE "_products_v" ADD COLUMN "version_rating_value" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_rating_count" numeric;
  ALTER TABLE "pages_blocks_categories_grid" ADD CONSTRAINT "pages_blocks_categories_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_block_services" ADD CONSTRAINT "pages_blocks_services_block_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_block" ADD CONSTRAINT "pages_blocks_services_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_categories_grid" ADD CONSTRAINT "_pages_v_blocks_categories_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_block_services" ADD CONSTRAINT "_pages_v_blocks_services_block_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_block" ADD CONSTRAINT "_pages_v_blocks_services_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_categories_grid_order_idx" ON "pages_blocks_categories_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_categories_grid_parent_id_idx" ON "pages_blocks_categories_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_categories_grid_path_idx" ON "pages_blocks_categories_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_block_services_order_idx" ON "pages_blocks_services_block_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_block_services_parent_id_idx" ON "pages_blocks_services_block_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_block_order_idx" ON "pages_blocks_services_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_block_parent_id_idx" ON "pages_blocks_services_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_block_path_idx" ON "pages_blocks_services_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_categories_grid_order_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_categories_grid_parent_id_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_categories_grid_path_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_block_services_order_idx" ON "_pages_v_blocks_services_block_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_block_services_parent_id_idx" ON "_pages_v_blocks_services_block_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_block_order_idx" ON "_pages_v_blocks_services_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_block_parent_id_idx" ON "_pages_v_blocks_services_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_block_path_idx" ON "_pages_v_blocks_services_block" USING btree ("_path");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_categories_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_block_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_categories_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_block_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_specs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_categories_grid" CASCADE;
  DROP TABLE "pages_blocks_services_block_services" CASCADE;
  DROP TABLE "pages_blocks_services_block" CASCADE;
  DROP TABLE "_pages_v_blocks_categories_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_services_block_services" CASCADE;
  DROP TABLE "_pages_v_blocks_services_block" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  DROP INDEX "categories_parent_idx";
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  ALTER TABLE "products" DROP COLUMN "sku";
  ALTER TABLE "products" DROP COLUMN "in_stock";
  ALTER TABLE "products" DROP COLUMN "rating_value";
  ALTER TABLE "products" DROP COLUMN "rating_count";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku";
  ALTER TABLE "_products_v" DROP COLUMN "version_in_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_rating_value";
  ALTER TABLE "_products_v" DROP COLUMN "version_rating_count";
  DROP TYPE "public"."enum_products_in_stock";
  DROP TYPE "public"."enum__products_v_version_in_stock";`)
}
