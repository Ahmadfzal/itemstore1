import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storeSettingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("Game Store"),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  storeTheme: text("store_theme").notNull().default("gaming"),
  adminPassword: text("admin_password").notNull().default("admin123"),
  packageUnit: text("package_unit").notNull().default("Diamond"),
  categories: text("categories").notNull().default('["Starter","Popular","Premium"]'),
  units: text("units").notNull().default('["Diamond","Chip","Pulsa","Kredit","Koin","Token","UC","Voucher"]'),
  heroStatus: text("hero_status").notNull().default("SYSTEM ONLINE"),
  heroTitle1: text("hero_title1").notNull().default("POWER UP"),
  heroTitle2: text("hero_title2").notNull().default("YOUR GAME"),
  heroSubtitle: text("hero_subtitle").notNull().default("Instant delivery, secure payments, and the best rates across the multiverse. Select your package and dominate the leaderboard."),
  heroBgImage: text("hero_bg_image"),
});

export const insertSettingsSchema = createInsertSchema(storeSettingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type StoreSettings = typeof storeSettingsTable.$inferSelect;
