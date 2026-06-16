import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storeSettingsTable } from "@workspace/db";
import { AdminLoginBody, UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_CATEGORIES = '["Starter","Popular","Premium"]';
const DEFAULT_UNITS = '["Diamond","Chip","Pulsa","Kredit","Koin","Token","UC","Voucher"]';
const DEFAULT_HERO_STATUS = "SYSTEM ONLINE";
const DEFAULT_HERO_TITLE1 = "POWER UP";
const DEFAULT_HERO_TITLE2 = "YOUR GAME";
const DEFAULT_HERO_SUBTITLE = "Instant delivery, secure payments, and the best rates across the multiverse. Select your package and dominate the leaderboard.";

function toSettingsResponse(s: typeof storeSettingsTable.$inferSelect) {
  return {
    storeName: s.storeName,
    whatsappNumber: s.whatsappNumber,
    storeTheme: s.storeTheme,
    packageUnit: s.packageUnit ?? "Diamond",
    categories: s.categories ?? DEFAULT_CATEGORIES,
    units: s.units ?? DEFAULT_UNITS,
    heroStatus: s.heroStatus ?? DEFAULT_HERO_STATUS,
    heroTitle1: s.heroTitle1 ?? DEFAULT_HERO_TITLE1,
    heroTitle2: s.heroTitle2 ?? DEFAULT_HERO_TITLE2,
    heroSubtitle: s.heroSubtitle ?? DEFAULT_HERO_SUBTITLE,
    heroBgImage: s.heroBgImage ?? null,
  };
}

router.get("/settings", async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(storeSettingsTable).limit(1);
  if (!settings) {
    res.json({
      storeName: "Game Store",
      whatsappNumber: "",
      storeTheme: "gaming",
      packageUnit: "Diamond",
      categories: DEFAULT_CATEGORIES,
      units: DEFAULT_UNITS,
      heroStatus: DEFAULT_HERO_STATUS,
      heroTitle1: DEFAULT_HERO_TITLE1,
      heroTitle2: DEFAULT_HERO_TITLE2,
      heroSubtitle: DEFAULT_HERO_SUBTITLE,
      heroBgImage: null,
    });
    return;
  }
  res.json(toSettingsResponse(settings));
});

router.post("/admin/login", async (req, res): Promise<void> => {
  const body = AdminLoginBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [settings] = await db.select().from(storeSettingsTable).limit(1);
  const adminPassword = settings?.adminPassword ?? "admin123";
  res.json({ success: body.data.password === adminPassword });
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const body = UpdateSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const rawBody = req.body as Record<string, unknown>;
  const [existing] = await db.select().from(storeSettingsTable).limit(1);

  const updates: Record<string, unknown> = {};
  if (body.data.storeName != null) updates.storeName = body.data.storeName;
  if (body.data.whatsappNumber != null) updates.whatsappNumber = body.data.whatsappNumber;
  if (body.data.storeTheme != null) updates.storeTheme = body.data.storeTheme;
  if (body.data.adminPassword != null) updates.adminPassword = body.data.adminPassword;
  if (rawBody.packageUnit != null) updates.packageUnit = rawBody.packageUnit;
  if (rawBody.categories != null) updates.categories = typeof rawBody.categories === "string" ? rawBody.categories : JSON.stringify(rawBody.categories);
  if (rawBody.units != null) updates.units = typeof rawBody.units === "string" ? rawBody.units : JSON.stringify(rawBody.units);
  if (body.data.heroStatus != null) updates.heroStatus = body.data.heroStatus;
  if (body.data.heroTitle1 != null) updates.heroTitle1 = body.data.heroTitle1;
  if (body.data.heroTitle2 != null) updates.heroTitle2 = body.data.heroTitle2;
  if (body.data.heroSubtitle != null) updates.heroSubtitle = body.data.heroSubtitle;
  // Allow setting heroBgImage to null (to remove) or a string (base64 data URL)
  if ("heroBgImage" in rawBody) updates.heroBgImage = rawBody.heroBgImage ?? null;

  let updated;
  if (!existing) {
    [updated] = await db
      .insert(storeSettingsTable)
      .values({
        storeName: (body.data.storeName as string) ?? "Game Store",
        whatsappNumber: (body.data.whatsappNumber as string) ?? "",
        storeTheme: (body.data.storeTheme as string) ?? "gaming",
        adminPassword: (body.data.adminPassword as string) ?? "admin123",
        categories: DEFAULT_CATEGORIES,
        units: DEFAULT_UNITS,
      })
      .returning();
  } else {
    [updated] = await db
      .update(storeSettingsTable)
      .set(updates)
      .where(eq(storeSettingsTable.id, existing.id))
      .returning();
  }

  res.json(toSettingsResponse(updated));
});

export default router;
