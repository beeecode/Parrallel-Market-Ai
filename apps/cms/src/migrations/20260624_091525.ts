import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({
  db,
  payload: _payload,
  req: _req,
}: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'analyst', 'business-owner', 'viewer');
  CREATE TYPE "public"."enum_media_category" AS ENUM('avatar', 'product', 'page', 'report', 'general');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_products_currency" AS ENUM('NGN', 'USD', 'GBP', 'EUR');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_simulations_status" AS ENUM('draft', 'queued', 'running', 'paused', 'completed', 'failed');
  CREATE TYPE "public"."enum_simulations_currency" AS ENUM('NGN', 'USD', 'GBP', 'EUR');
  CREATE TYPE "public"."enum_customer_agents_price_sensitivity" AS ENUM('low', 'moderate', 'high', 'very-high');
  CREATE TYPE "public"."enum_conversations_status" AS ENUM('pending', 'active', 'completed', 'cancelled', 'failed');
  CREATE TYPE "public"."enum_messages_sender_type" AS ENUM('customer', 'business', 'system');
  CREATE TYPE "public"."enum_messages_sentiment" AS ENUM('positive', 'neutral', 'negative', 'mixed', 'unknown');
  CREATE TYPE "public"."enum_messages_buying_intent" AS ENUM('none', 'low', 'medium', 'high', 'converted');
  CREATE TYPE "public"."enum_reports_positive_feedback_importance" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_reports_customer_objections_importance" AS ENUM('low', 'medium', 'high', 'critical');
  CREATE TYPE "public"."enum_reports_risk_factors_importance" AS ENUM('low', 'medium', 'high', 'critical');
  CREATE TYPE "public"."enum_reports_recommendations_importance" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_reports_status" AS ENUM('draft', 'generating', 'completed', 'failed');
  CREATE TYPE "public"."enum_reports_currency" AS ENUM('NGN', 'USD', 'GBP', 'EUR');
  CREATE TYPE "public"."enum_custom_simulation_requests_currency" AS ENUM('NGN', 'USD', 'GBP', 'EUR');
  CREATE TYPE "public"."enum_custom_simulation_requests_status" AS ENUM('new', 'reviewing', 'approved', 'rejected', 'converted');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'business-owner' NOT NULL,
  	"company" varchar,
  	"avatar_id" integer,
  	"is_active" boolean DEFAULT true,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"category" "enum_media_category" DEFAULT 'general' NOT NULL,
  	"uploaded_by_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"primary_action_label" varchar,
  	"primary_action_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_pages_status" DEFAULT 'draft' NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer NOT NULL,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"current_price" numeric NOT NULL,
  	"currency" "enum_products_currency" DEFAULT 'NGN' NOT NULL,
  	"target_market" varchar NOT NULL,
  	"target_location" varchar NOT NULL,
  	"status" "enum_products_status" DEFAULT 'draft' NOT NULL,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "simulations_configuration_customer_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"segment" varchar NOT NULL
  );
  
  CREATE TABLE "simulations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"product_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"target_audience" varchar NOT NULL,
  	"target_location" varchar NOT NULL,
  	"customer_count" numeric NOT NULL,
  	"status" "enum_simulations_status" DEFAULT 'draft' NOT NULL,
  	"success_probability" numeric,
  	"purchase_rate" numeric,
  	"repeat_rate" numeric,
  	"revenue_minimum" numeric,
  	"revenue_maximum" numeric,
  	"currency" "enum_simulations_currency" DEFAULT 'NGN' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"configuration_simulation_goal" varchar,
  	"configuration_market_conditions" varchar,
  	"configuration_pricing_strategy" varchar,
  	"configuration_competitor_context" varchar,
  	"configuration_additional_instructions" varchar,
  	"failure_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customer_agents_interests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"interest" varchar NOT NULL
  );
  
  CREATE TABLE "customer_agents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"simulation_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"age" numeric NOT NULL,
  	"location" varchar NOT NULL,
  	"occupation" varchar,
  	"income_level" varchar,
  	"personality" varchar,
  	"buying_behaviour" varchar,
  	"price_sensitivity" "enum_customer_agents_price_sensitivity" DEFAULT 'moderate' NOT NULL,
  	"communication_style" varchar,
  	"avatar_id" integer,
  	"is_active" boolean DEFAULT true,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"simulation_id" integer NOT NULL,
  	"customer_agent_id" integer NOT NULL,
  	"status" "enum_conversations_status" DEFAULT 'pending' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"ended_at" timestamp(3) with time zone,
  	"summary" varchar,
  	"message_count" numeric DEFAULT 0,
  	"last_message_at" timestamp(3) with time zone,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"simulation_id" integer NOT NULL,
  	"customer_agent_id" integer,
  	"sender_type" "enum_messages_sender_type" NOT NULL,
  	"content" varchar NOT NULL,
  	"sentiment" "enum_messages_sentiment" DEFAULT 'unknown',
  	"buying_intent" "enum_messages_buying_intent" DEFAULT 'none',
  	"objection_category" varchar,
  	"metadata" jsonb,
  	"sent_at" timestamp(3) with time zone NOT NULL,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reports_positive_feedback" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"importance" "enum_reports_positive_feedback_importance" NOT NULL
  );
  
  CREATE TABLE "reports_customer_objections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"importance" "enum_reports_customer_objections_importance" NOT NULL
  );
  
  CREATE TABLE "reports_risk_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"importance" "enum_reports_risk_factors_importance" NOT NULL
  );
  
  CREATE TABLE "reports_recommendations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"importance" "enum_reports_recommendations_importance" NOT NULL
  );
  
  CREATE TABLE "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"simulation_id" integer NOT NULL,
  	"status" "enum_reports_status" DEFAULT 'draft' NOT NULL,
  	"success_probability" numeric NOT NULL,
  	"positive_sentiment" numeric NOT NULL,
  	"neutral_sentiment" numeric NOT NULL,
  	"negative_sentiment" numeric NOT NULL,
  	"optimal_price_minimum" numeric NOT NULL,
  	"optimal_price_maximum" numeric NOT NULL,
  	"current_average_price" numeric NOT NULL,
  	"currency" "enum_reports_currency" DEFAULT 'NGN' NOT NULL,
  	"revenue_minimum" numeric NOT NULL,
  	"revenue_maximum" numeric NOT NULL,
  	"executive_summary" varchar NOT NULL,
  	"generated_at" timestamp(3) with time zone,
  	"version" numeric DEFAULT 1 NOT NULL,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "custom_simulation_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar NOT NULL,
  	"business_type" varchar NOT NULL,
  	"product_name" varchar NOT NULL,
  	"product_description" varchar NOT NULL,
  	"target_market" varchar NOT NULL,
  	"target_location" varchar NOT NULL,
  	"target_customers" varchar NOT NULL,
  	"current_price" numeric,
  	"currency" "enum_custom_simulation_requests_currency" DEFAULT 'NGN' NOT NULL,
  	"business_challenge" varchar NOT NULL,
  	"simulation_goal" varchar NOT NULL,
  	"budget" numeric,
  	"timeline" varchar NOT NULL,
  	"conversation_summary" varchar,
  	"status" "enum_custom_simulation_requests_status" DEFAULT 'new' NOT NULL,
  	"submitted_at" timestamp(3) with time zone,
  	"converted_product_id" integer,
  	"converted_simulation_id" integer,
  	"assigned_to_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"products_id" integer,
  	"simulations_id" integer,
  	"customer_agents_id" integer,
  	"conversations_id" integer,
  	"messages_id" integer,
  	"reports_id" integer,
  	"custom_simulation_requests_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_features" ADD CONSTRAINT "pages_blocks_feature_grid_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_features" ADD CONSTRAINT "pages_blocks_feature_grid_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simulations_configuration_customer_segments" ADD CONSTRAINT "simulations_configuration_customer_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."simulations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "simulations" ADD CONSTRAINT "simulations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simulations" ADD CONSTRAINT "simulations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simulations" ADD CONSTRAINT "simulations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "simulations" ADD CONSTRAINT "simulations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_agents_interests" ADD CONSTRAINT "customer_agents_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customer_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_agents" ADD CONSTRAINT "customer_agents_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_agents" ADD CONSTRAINT "customer_agents_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_agents" ADD CONSTRAINT "customer_agents_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_agents" ADD CONSTRAINT "customer_agents_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_agent_id_customer_agents_id_fk" FOREIGN KEY ("customer_agent_id") REFERENCES "public"."customer_agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_customer_agent_id_customer_agents_id_fk" FOREIGN KEY ("customer_agent_id") REFERENCES "public"."customer_agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports_positive_feedback" ADD CONSTRAINT "reports_positive_feedback_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_customer_objections" ADD CONSTRAINT "reports_customer_objections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_risk_factors" ADD CONSTRAINT "reports_risk_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_recommendations" ADD CONSTRAINT "reports_recommendations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "custom_simulation_requests" ADD CONSTRAINT "custom_simulation_requests_converted_product_id_products_id_fk" FOREIGN KEY ("converted_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "custom_simulation_requests" ADD CONSTRAINT "custom_simulation_requests_converted_simulation_id_simulations_id_fk" FOREIGN KEY ("converted_simulation_id") REFERENCES "public"."simulations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "custom_simulation_requests" ADD CONSTRAINT "custom_simulation_requests_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_simulations_fk" FOREIGN KEY ("simulations_id") REFERENCES "public"."simulations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_agents_fk" FOREIGN KEY ("customer_agents_id") REFERENCES "public"."customer_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_simulation_requests_fk" FOREIGN KEY ("custom_simulation_requests_id") REFERENCES "public"."custom_simulation_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_category_idx" ON "media" USING btree ("category");
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_grid_features_order_idx" ON "pages_blocks_feature_grid_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_features_parent_id_idx" ON "pages_blocks_feature_grid_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_features_image_idx" ON "pages_blocks_feature_grid_features" USING btree ("image_id");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");
  CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
  CREATE INDEX "pages_created_by_idx" ON "pages" USING btree ("created_by_id");
  CREATE INDEX "pages_updated_by_idx" ON "pages" USING btree ("updated_by_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "products_owner_idx" ON "products" USING btree ("owner_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX "products_status_idx" ON "products" USING btree ("status");
  CREATE INDEX "products_created_by_idx" ON "products" USING btree ("created_by_id");
  CREATE INDEX "products_updated_by_idx" ON "products" USING btree ("updated_by_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "owner_status_idx" ON "products" USING btree ("owner_id","status");
  CREATE INDEX "simulations_configuration_customer_segments_order_idx" ON "simulations_configuration_customer_segments" USING btree ("_order");
  CREATE INDEX "simulations_configuration_customer_segments_parent_id_idx" ON "simulations_configuration_customer_segments" USING btree ("_parent_id");
  CREATE INDEX "simulations_owner_idx" ON "simulations" USING btree ("owner_id");
  CREATE INDEX "simulations_product_idx" ON "simulations" USING btree ("product_id");
  CREATE INDEX "simulations_status_idx" ON "simulations" USING btree ("status");
  CREATE INDEX "simulations_created_by_idx" ON "simulations" USING btree ("created_by_id");
  CREATE INDEX "simulations_updated_by_idx" ON "simulations" USING btree ("updated_by_id");
  CREATE INDEX "simulations_updated_at_idx" ON "simulations" USING btree ("updated_at");
  CREATE INDEX "simulations_created_at_idx" ON "simulations" USING btree ("created_at");
  CREATE INDEX "owner_status_1_idx" ON "simulations" USING btree ("owner_id","status");
  CREATE INDEX "product_status_idx" ON "simulations" USING btree ("product_id","status");
  CREATE INDEX "customer_agents_interests_order_idx" ON "customer_agents_interests" USING btree ("_order");
  CREATE INDEX "customer_agents_interests_parent_id_idx" ON "customer_agents_interests" USING btree ("_parent_id");
  CREATE INDEX "customer_agents_simulation_idx" ON "customer_agents" USING btree ("simulation_id");
  CREATE INDEX "customer_agents_avatar_idx" ON "customer_agents" USING btree ("avatar_id");
  CREATE INDEX "customer_agents_is_active_idx" ON "customer_agents" USING btree ("is_active");
  CREATE INDEX "customer_agents_created_by_idx" ON "customer_agents" USING btree ("created_by_id");
  CREATE INDEX "customer_agents_updated_by_idx" ON "customer_agents" USING btree ("updated_by_id");
  CREATE INDEX "customer_agents_updated_at_idx" ON "customer_agents" USING btree ("updated_at");
  CREATE INDEX "customer_agents_created_at_idx" ON "customer_agents" USING btree ("created_at");
  CREATE INDEX "simulation_isActive_idx" ON "customer_agents" USING btree ("simulation_id","is_active");
  CREATE INDEX "conversations_simulation_idx" ON "conversations" USING btree ("simulation_id");
  CREATE INDEX "conversations_customer_agent_idx" ON "conversations" USING btree ("customer_agent_id");
  CREATE INDEX "conversations_status_idx" ON "conversations" USING btree ("status");
  CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");
  CREATE INDEX "conversations_created_by_idx" ON "conversations" USING btree ("created_by_id");
  CREATE INDEX "conversations_updated_by_idx" ON "conversations" USING btree ("updated_by_id");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  CREATE INDEX "simulation_customerAgent_idx" ON "conversations" USING btree ("simulation_id","customer_agent_id");
  CREATE INDEX "simulation_status_idx" ON "conversations" USING btree ("simulation_id","status");
  CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");
  CREATE INDEX "messages_simulation_idx" ON "messages" USING btree ("simulation_id");
  CREATE INDEX "messages_customer_agent_idx" ON "messages" USING btree ("customer_agent_id");
  CREATE INDEX "messages_sent_at_idx" ON "messages" USING btree ("sent_at");
  CREATE INDEX "messages_created_by_idx" ON "messages" USING btree ("created_by_id");
  CREATE INDEX "messages_updated_by_idx" ON "messages" USING btree ("updated_by_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "conversation_sentAt_idx" ON "messages" USING btree ("conversation_id","sent_at");
  CREATE INDEX "simulation_sentAt_idx" ON "messages" USING btree ("simulation_id","sent_at");
  CREATE INDEX "reports_positive_feedback_order_idx" ON "reports_positive_feedback" USING btree ("_order");
  CREATE INDEX "reports_positive_feedback_parent_id_idx" ON "reports_positive_feedback" USING btree ("_parent_id");
  CREATE INDEX "reports_customer_objections_order_idx" ON "reports_customer_objections" USING btree ("_order");
  CREATE INDEX "reports_customer_objections_parent_id_idx" ON "reports_customer_objections" USING btree ("_parent_id");
  CREATE INDEX "reports_risk_factors_order_idx" ON "reports_risk_factors" USING btree ("_order");
  CREATE INDEX "reports_risk_factors_parent_id_idx" ON "reports_risk_factors" USING btree ("_parent_id");
  CREATE INDEX "reports_recommendations_order_idx" ON "reports_recommendations" USING btree ("_order");
  CREATE INDEX "reports_recommendations_parent_id_idx" ON "reports_recommendations" USING btree ("_parent_id");
  CREATE INDEX "reports_simulation_idx" ON "reports" USING btree ("simulation_id");
  CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");
  CREATE INDEX "reports_generated_at_idx" ON "reports" USING btree ("generated_at");
  CREATE INDEX "reports_created_by_idx" ON "reports" USING btree ("created_by_id");
  CREATE INDEX "reports_updated_by_idx" ON "reports" USING btree ("updated_by_id");
  CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE UNIQUE INDEX "simulation_version_idx" ON "reports" USING btree ("simulation_id","version");
  CREATE INDEX "custom_simulation_requests_email_idx" ON "custom_simulation_requests" USING btree ("email");
  CREATE INDEX "custom_simulation_requests_status_idx" ON "custom_simulation_requests" USING btree ("status");
  CREATE INDEX "custom_simulation_requests_submitted_at_idx" ON "custom_simulation_requests" USING btree ("submitted_at");
  CREATE INDEX "custom_simulation_requests_converted_product_idx" ON "custom_simulation_requests" USING btree ("converted_product_id");
  CREATE INDEX "custom_simulation_requests_converted_simulation_idx" ON "custom_simulation_requests" USING btree ("converted_simulation_id");
  CREATE INDEX "custom_simulation_requests_assigned_to_idx" ON "custom_simulation_requests" USING btree ("assigned_to_id");
  CREATE INDEX "custom_simulation_requests_updated_at_idx" ON "custom_simulation_requests" USING btree ("updated_at");
  CREATE INDEX "custom_simulation_requests_created_at_idx" ON "custom_simulation_requests" USING btree ("created_at");
  CREATE INDEX "status_submittedAt_idx" ON "custom_simulation_requests" USING btree ("status","submitted_at");
  CREATE INDEX "email_submittedAt_idx" ON "custom_simulation_requests" USING btree ("email","submitted_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_simulations_id_idx" ON "payload_locked_documents_rels" USING btree ("simulations_id");
  CREATE INDEX "payload_locked_documents_rels_customer_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_agents_id");
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_custom_simulation_requests_idx" ON "payload_locked_documents_rels" USING btree ("custom_simulation_requests_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({
  db,
  payload: _payload,
  req: _req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_features" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "simulations_configuration_customer_segments" CASCADE;
  DROP TABLE "simulations" CASCADE;
  DROP TABLE "customer_agents_interests" CASCADE;
  DROP TABLE "customer_agents" CASCADE;
  DROP TABLE "conversations" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "reports_positive_feedback" CASCADE;
  DROP TABLE "reports_customer_objections" CASCADE;
  DROP TABLE "reports_risk_factors" CASCADE;
  DROP TABLE "reports_recommendations" CASCADE;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "custom_simulation_requests" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_media_category";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_products_currency";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_simulations_status";
  DROP TYPE "public"."enum_simulations_currency";
  DROP TYPE "public"."enum_customer_agents_price_sensitivity";
  DROP TYPE "public"."enum_conversations_status";
  DROP TYPE "public"."enum_messages_sender_type";
  DROP TYPE "public"."enum_messages_sentiment";
  DROP TYPE "public"."enum_messages_buying_intent";
  DROP TYPE "public"."enum_reports_positive_feedback_importance";
  DROP TYPE "public"."enum_reports_customer_objections_importance";
  DROP TYPE "public"."enum_reports_risk_factors_importance";
  DROP TYPE "public"."enum_reports_recommendations_importance";
  DROP TYPE "public"."enum_reports_status";
  DROP TYPE "public"."enum_reports_currency";
  DROP TYPE "public"."enum_custom_simulation_requests_currency";
  DROP TYPE "public"."enum_custom_simulation_requests_status";`)
}
