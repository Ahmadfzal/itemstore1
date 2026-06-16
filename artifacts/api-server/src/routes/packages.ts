import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, packagesTable } from "@workspace/db";
import {
  ListPackagesResponse,
  CreatePackageBody,
  UpdatePackageParams,
  UpdatePackageBody,
  UpdatePackageResponse,
  DeletePackageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/packages", async (_req, res): Promise<void> => {
  const packages = await db
    .select()
    .from(packagesTable)
    .orderBy(packagesTable.id);

  res.json(packages.map(p => ({
    ...p,
    price: Number(p.price),
    unit: p.unit ?? "Diamond",
  })));
});

router.post("/admin/packages", async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [pkg] = await db
    .insert(packagesTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      amount: parsed.data.amount,
      price: String(parsed.data.price),
      currency: "IDR",
      category: parsed.data.category,
      popular: parsed.data.popular,
      unit: typeof body.unit === "string" ? body.unit : "Diamond",
    })
    .returning();

  res.status(201).json({ ...pkg, price: Number(pkg.price), unit: pkg.unit ?? "Diamond" });
});

router.patch("/admin/packages/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePackageParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid package ID" });
    return;
  }

  const body = UpdatePackageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const rawBody = req.body as Record<string, unknown>;

  const [existing] = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.id, params.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Package not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.name != null) updates.name = body.data.name;
  if (body.data.description != null) updates.description = body.data.description;
  if (body.data.amount != null) updates.amount = body.data.amount;
  if (body.data.price != null) updates.price = String(body.data.price);
  updates.currency = "IDR";
  if (body.data.category != null) updates.category = body.data.category;
  if (body.data.popular != null) updates.popular = body.data.popular;
  if (typeof rawBody.unit === "string") updates.unit = rawBody.unit;

  const [updated] = await db
    .update(packagesTable)
    .set(updates)
    .where(eq(packagesTable.id, params.data.id))
    .returning();

  res.json({ ...updated, price: Number(updated.price), unit: updated.unit ?? "Diamond" });
});

router.delete("/admin/packages/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePackageParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid package ID" });
    return;
  }

  const [existing] = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.id, params.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Package not found" });
    return;
  }

  await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;
