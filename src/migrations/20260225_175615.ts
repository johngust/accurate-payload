import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_promo_banners_source" AS ENUM('all_active', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_sale_with_carousel_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_promo_banners_source" AS ENUM('all_active', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_sale_with_carousel_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_promotions_type" AS ENUM('hero', 'banner', 'sale');
  CREATE TABLE "pages_blocks_category_icons_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_promo_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_blocks_promo_banners_source" DEFAULT 'all_active',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_category_product_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_brands_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Только оригинальные бренды',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sale_with_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"promotion_id" integer,
  	"populate_by" "enum_pages_blocks_sale_with_carousel_populate_by" DEFAULT 'collection',
  	"category_id" integer,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_service_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_sets_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"price" numeric,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_product_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Популярные готовые решения',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_promo_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Все акции в одном месте',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_image_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Идеи для дома',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_icons_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_promo_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__pages_v_blocks_promo_banners_source" DEFAULT 'all_active',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_product_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_brands_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Только оригинальные бренды',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sale_with_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"promotion_id" integer,
  	"populate_by" "enum__pages_v_blocks_sale_with_carousel_populate_by" DEFAULT 'collection',
  	"category_id" integer,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_sets_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"price" numeric,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Популярные готовые решения',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_promo_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Все акции в одном месте',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Идеи для дома',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"image_id" integer NOT NULL,
  	"link_url" varchar,
  	"link_label" varchar,
  	"type" "enum_promotions_type" DEFAULT 'banner' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "featured_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Товар дня' NOT NULL,
  	"product_id" integer NOT NULL,
  	"discount_percent" numeric,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "featured_products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"link_url" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "featured_products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "footer" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "footer" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "pages_blocks_category_icons_row" ADD CONSTRAINT "pages_blocks_category_icons_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_promo_banners" ADD CONSTRAINT "pages_blocks_promo_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_product_tabs" ADD CONSTRAINT "pages_blocks_category_product_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_brands_block" ADD CONSTRAINT "pages_blocks_brands_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sale_with_carousel" ADD CONSTRAINT "pages_blocks_sale_with_carousel_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sale_with_carousel" ADD CONSTRAINT "pages_blocks_sale_with_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sale_with_carousel" ADD CONSTRAINT "pages_blocks_sale_with_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards_cards" ADD CONSTRAINT "pages_blocks_service_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards" ADD CONSTRAINT "pages_blocks_service_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_sets_sets" ADD CONSTRAINT "pages_blocks_product_sets_sets_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_sets_sets" ADD CONSTRAINT "pages_blocks_product_sets_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_product_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_sets" ADD CONSTRAINT "pages_blocks_product_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_promo_grid" ADD CONSTRAINT "pages_blocks_promo_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery_images" ADD CONSTRAINT "pages_blocks_image_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery_images" ADD CONSTRAINT "pages_blocks_image_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery" ADD CONSTRAINT "pages_blocks_image_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_icons_row" ADD CONSTRAINT "_pages_v_blocks_category_icons_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_promo_banners" ADD CONSTRAINT "_pages_v_blocks_promo_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_product_tabs" ADD CONSTRAINT "_pages_v_blocks_category_product_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brands_block" ADD CONSTRAINT "_pages_v_blocks_brands_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sale_with_carousel" ADD CONSTRAINT "_pages_v_blocks_sale_with_carousel_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sale_with_carousel" ADD CONSTRAINT "_pages_v_blocks_sale_with_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sale_with_carousel" ADD CONSTRAINT "_pages_v_blocks_sale_with_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_cards_cards" ADD CONSTRAINT "_pages_v_blocks_service_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_cards" ADD CONSTRAINT "_pages_v_blocks_service_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_sets_sets" ADD CONSTRAINT "_pages_v_blocks_product_sets_sets_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_sets_sets" ADD CONSTRAINT "_pages_v_blocks_product_sets_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_product_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_sets" ADD CONSTRAINT "_pages_v_blocks_product_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_promo_grid" ADD CONSTRAINT "_pages_v_blocks_promo_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery_images" ADD CONSTRAINT "_pages_v_blocks_image_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery_images" ADD CONSTRAINT "_pages_v_blocks_image_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery" ADD CONSTRAINT "_pages_v_blocks_image_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions" ADD CONSTRAINT "promotions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products" ADD CONSTRAINT "featured_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_products_rels" ADD CONSTRAINT "featured_products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_category_icons_row_order_idx" ON "pages_blocks_category_icons_row" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_icons_row_parent_id_idx" ON "pages_blocks_category_icons_row" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_icons_row_path_idx" ON "pages_blocks_category_icons_row" USING btree ("_path");
  CREATE INDEX "pages_blocks_promo_banners_order_idx" ON "pages_blocks_promo_banners" USING btree ("_order");
  CREATE INDEX "pages_blocks_promo_banners_parent_id_idx" ON "pages_blocks_promo_banners" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_promo_banners_path_idx" ON "pages_blocks_promo_banners" USING btree ("_path");
  CREATE INDEX "pages_blocks_category_product_tabs_order_idx" ON "pages_blocks_category_product_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_product_tabs_parent_id_idx" ON "pages_blocks_category_product_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_product_tabs_path_idx" ON "pages_blocks_category_product_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_brands_block_order_idx" ON "pages_blocks_brands_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_brands_block_parent_id_idx" ON "pages_blocks_brands_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_brands_block_path_idx" ON "pages_blocks_brands_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_sale_with_carousel_order_idx" ON "pages_blocks_sale_with_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_sale_with_carousel_parent_id_idx" ON "pages_blocks_sale_with_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sale_with_carousel_path_idx" ON "pages_blocks_sale_with_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_sale_with_carousel_promotion_idx" ON "pages_blocks_sale_with_carousel" USING btree ("promotion_id");
  CREATE INDEX "pages_blocks_sale_with_carousel_category_idx" ON "pages_blocks_sale_with_carousel" USING btree ("category_id");
  CREATE INDEX "pages_blocks_service_cards_cards_order_idx" ON "pages_blocks_service_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_cards_parent_id_idx" ON "pages_blocks_service_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_order_idx" ON "pages_blocks_service_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_parent_id_idx" ON "pages_blocks_service_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_path_idx" ON "pages_blocks_service_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_sets_sets_order_idx" ON "pages_blocks_product_sets_sets" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_sets_sets_parent_id_idx" ON "pages_blocks_product_sets_sets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_sets_sets_image_idx" ON "pages_blocks_product_sets_sets" USING btree ("image_id");
  CREATE INDEX "pages_blocks_product_sets_order_idx" ON "pages_blocks_product_sets" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_sets_parent_id_idx" ON "pages_blocks_product_sets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_sets_path_idx" ON "pages_blocks_product_sets" USING btree ("_path");
  CREATE INDEX "pages_blocks_promo_grid_order_idx" ON "pages_blocks_promo_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_promo_grid_parent_id_idx" ON "pages_blocks_promo_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_promo_grid_path_idx" ON "pages_blocks_promo_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_gallery_images_order_idx" ON "pages_blocks_image_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_gallery_images_parent_id_idx" ON "pages_blocks_image_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_gallery_images_image_idx" ON "pages_blocks_image_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_image_gallery_order_idx" ON "pages_blocks_image_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_gallery_parent_id_idx" ON "pages_blocks_image_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_gallery_path_idx" ON "pages_blocks_image_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_category_icons_row_order_idx" ON "_pages_v_blocks_category_icons_row" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_icons_row_parent_id_idx" ON "_pages_v_blocks_category_icons_row" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_icons_row_path_idx" ON "_pages_v_blocks_category_icons_row" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_promo_banners_order_idx" ON "_pages_v_blocks_promo_banners" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_promo_banners_parent_id_idx" ON "_pages_v_blocks_promo_banners" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_promo_banners_path_idx" ON "_pages_v_blocks_promo_banners" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_category_product_tabs_order_idx" ON "_pages_v_blocks_category_product_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_product_tabs_parent_id_idx" ON "_pages_v_blocks_category_product_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_product_tabs_path_idx" ON "_pages_v_blocks_category_product_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_brands_block_order_idx" ON "_pages_v_blocks_brands_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_brands_block_parent_id_idx" ON "_pages_v_blocks_brands_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_brands_block_path_idx" ON "_pages_v_blocks_brands_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sale_with_carousel_order_idx" ON "_pages_v_blocks_sale_with_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sale_with_carousel_parent_id_idx" ON "_pages_v_blocks_sale_with_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sale_with_carousel_path_idx" ON "_pages_v_blocks_sale_with_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sale_with_carousel_promotion_idx" ON "_pages_v_blocks_sale_with_carousel" USING btree ("promotion_id");
  CREATE INDEX "_pages_v_blocks_sale_with_carousel_category_idx" ON "_pages_v_blocks_sale_with_carousel" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_service_cards_cards_order_idx" ON "_pages_v_blocks_service_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_cards_cards_parent_id_idx" ON "_pages_v_blocks_service_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_cards_order_idx" ON "_pages_v_blocks_service_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_cards_parent_id_idx" ON "_pages_v_blocks_service_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_cards_path_idx" ON "_pages_v_blocks_service_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_sets_sets_order_idx" ON "_pages_v_blocks_product_sets_sets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_sets_sets_parent_id_idx" ON "_pages_v_blocks_product_sets_sets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_sets_sets_image_idx" ON "_pages_v_blocks_product_sets_sets" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_product_sets_order_idx" ON "_pages_v_blocks_product_sets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_sets_parent_id_idx" ON "_pages_v_blocks_product_sets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_sets_path_idx" ON "_pages_v_blocks_product_sets" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_promo_grid_order_idx" ON "_pages_v_blocks_promo_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_promo_grid_parent_id_idx" ON "_pages_v_blocks_promo_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_promo_grid_path_idx" ON "_pages_v_blocks_promo_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_order_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_parent_id_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_image_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_order_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_gallery_parent_id_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_path_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_path");
  CREATE INDEX "promotions_image_idx" ON "promotions" USING btree ("image_id");
  CREATE INDEX "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE INDEX "promotions_rels_order_idx" ON "promotions_rels" USING btree ("order");
  CREATE INDEX "promotions_rels_parent_idx" ON "promotions_rels" USING btree ("parent_id");
  CREATE INDEX "promotions_rels_path_idx" ON "promotions_rels" USING btree ("path");
  CREATE INDEX "promotions_rels_categories_id_idx" ON "promotions_rels" USING btree ("categories_id");
  CREATE INDEX "featured_products_product_idx" ON "featured_products" USING btree ("product_id");
  CREATE INDEX "featured_products_updated_at_idx" ON "featured_products" USING btree ("updated_at");
  CREATE INDEX "featured_products_created_at_idx" ON "featured_products" USING btree ("created_at");
  CREATE INDEX "featured_products_rels_order_idx" ON "featured_products_rels" USING btree ("order");
  CREATE INDEX "featured_products_rels_parent_idx" ON "featured_products_rels" USING btree ("parent_id");
  CREATE INDEX "featured_products_rels_path_idx" ON "featured_products_rels" USING btree ("path");
  CREATE INDEX "featured_products_rels_categories_id_idx" ON "featured_products_rels" USING btree ("categories_id");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_featured_products_fk" FOREIGN KEY ("featured_products_id") REFERENCES "public"."featured_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_promotions_id_idx" ON "pages_rels" USING btree ("promotions_id");
  CREATE INDEX "_pages_v_rels_promotions_id_idx" ON "_pages_v_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_featured_products_id_idx" ON "payload_locked_documents_rels" USING btree ("featured_products_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_category_icons_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_promo_banners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_category_product_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_brands_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sale_with_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_product_sets_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_product_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_promo_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_category_icons_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_promo_banners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_category_product_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brands_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sale_with_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_product_sets_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_product_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_promo_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "promotions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "promotions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "featured_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "featured_products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_category_icons_row" CASCADE;
  DROP TABLE "pages_blocks_promo_banners" CASCADE;
  DROP TABLE "pages_blocks_category_product_tabs" CASCADE;
  DROP TABLE "pages_blocks_brands_block" CASCADE;
  DROP TABLE "pages_blocks_sale_with_carousel" CASCADE;
  DROP TABLE "pages_blocks_service_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_service_cards" CASCADE;
  DROP TABLE "pages_blocks_product_sets_sets" CASCADE;
  DROP TABLE "pages_blocks_product_sets" CASCADE;
  DROP TABLE "pages_blocks_promo_grid" CASCADE;
  DROP TABLE "pages_blocks_image_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_image_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_category_icons_row" CASCADE;
  DROP TABLE "_pages_v_blocks_promo_banners" CASCADE;
  DROP TABLE "_pages_v_blocks_category_product_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_brands_block" CASCADE;
  DROP TABLE "_pages_v_blocks_sale_with_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_service_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_service_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_product_sets_sets" CASCADE;
  DROP TABLE "_pages_v_blocks_product_sets" CASCADE;
  DROP TABLE "_pages_v_blocks_promo_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_image_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_image_gallery" CASCADE;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "promotions_rels" CASCADE;
  DROP TABLE "featured_products" CASCADE;
  DROP TABLE "featured_products_rels" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_promotions_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_promotions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_promotions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_featured_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_brands_fk";
  
  DROP INDEX "pages_rels_promotions_id_idx";
  DROP INDEX "_pages_v_rels_promotions_id_idx";
  DROP INDEX "payload_locked_documents_rels_promotions_id_idx";
  DROP INDEX "payload_locked_documents_rels_featured_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_brands_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "promotions_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "promotions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "promotions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "featured_products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "brands_id";
  ALTER TABLE "footer" DROP COLUMN "contact_phone";
  ALTER TABLE "footer" DROP COLUMN "contact_email";
  DROP TYPE "public"."enum_pages_blocks_promo_banners_source";
  DROP TYPE "public"."enum_pages_blocks_sale_with_carousel_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_promo_banners_source";
  DROP TYPE "public"."enum__pages_v_blocks_sale_with_carousel_populate_by";
  DROP TYPE "public"."enum_promotions_type";`)
}
