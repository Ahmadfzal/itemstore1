import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, packagesTable } from "@workspace/db";
import { CreateOrderBody, UploadOrderProofBody, UploadOrderProofParams } from "@workspace/api-zod";

const router: IRouter = Router();

function mapOrder(order: Record<string, unknown>) {
  return {
    id: order.id,
    packageId: order.packageId,
    gameId: order.gameId,
    username: order.playerName ?? null,
    customerNotes: order.customerNotes ?? null,
    contactPhone: order.contactPhone,
    status: order.status,
    proofImageUrl: order.proofImageUrl ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const pkg = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.id, parsed.data.packageId))
    .limit(1);

  if (!pkg.length) {
    res.status(400).json({ error: "Package not found" });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      packageId: parsed.data.packageId,
      gameId: parsed.data.gameId,
      playerName: parsed.data.username ?? null,
      customerNotes: parsed.data.customerNotes ?? null,
      contactPhone: parsed.data.contactPhone,
      status: "pending",
    })
    .returning();

  res.status(201).json(mapOrder(order as unknown as Record<string, unknown>));
});

router.post("/orders/:id/proof", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UploadOrderProofParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const body = UploadOrderProofBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ proofImageUrl: body.data.proofImageUrl, status: "processing" })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  res.json(mapOrder(updated as unknown as Record<string, unknown>));
});

export default router;
