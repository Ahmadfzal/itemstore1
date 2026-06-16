import { Router, type IRouter } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, ordersTable, packagesTable } from "@workspace/db";
import { UpdateOrderStatusParams, UpdateOrderStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapOrderWithPackage(o: Record<string, unknown>, pkg: Record<string, unknown>) {
  return {
    id: o.id,
    packageId: o.packageId,
    gameId: o.gameId,
    username: o.playerName ?? null,
    customerNotes: o.customerNotes ?? null,
    contactPhone: o.contactPhone,
    status: o.status,
    proofImageUrl: o.proofImageUrl ?? null,
    notes: o.notes ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    package: pkg,
  };
}

router.get("/admin/orders", async (req, res): Promise<void> => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const rows = await db
    .select({
      id: ordersTable.id,
      packageId: ordersTable.packageId,
      gameId: ordersTable.gameId,
      playerName: ordersTable.playerName,
      customerNotes: ordersTable.customerNotes,
      contactPhone: ordersTable.contactPhone,
      status: ordersTable.status,
      proofImageUrl: ordersTable.proofImageUrl,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      pkg: {
        id: packagesTable.id,
        name: packagesTable.name,
        description: packagesTable.description,
        amount: packagesTable.amount,
        price: packagesTable.price,
        currency: packagesTable.currency,
        category: packagesTable.category,
        popular: packagesTable.popular,
        createdAt: packagesTable.createdAt,
      },
    })
    .from(ordersTable)
    .leftJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(isNull(ordersTable.hiddenAt))
    .orderBy(ordersTable.createdAt);

  const filtered = status ? rows.filter((r) => r.status === status) : rows;

  const result = filtered.map((r) => {
    const pkg = r.pkg
      ? { ...r.pkg, price: Number(r.pkg.price) }
      : { id: 0, name: "Unknown", description: "", amount: 0, price: 0, currency: "IDR", category: "", popular: false, createdAt: new Date() };
    return mapOrderWithPackage(r as unknown as Record<string, unknown>, pkg as unknown as Record<string, unknown>);
  });

  res.json(result);
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateOrderStatusParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const body = UpdateOrderStatusBody.safeParse(req.body);
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
    .set({ status: body.data.status, notes: body.data.notes ?? null })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  res.json({
    id: updated.id,
    packageId: updated.packageId,
    gameId: updated.gameId,
    username: updated.playerName ?? null,
    customerNotes: updated.customerNotes ?? null,
    contactPhone: updated.contactPhone,
    status: updated.status,
    proofImageUrl: updated.proofImageUrl ?? null,
    notes: updated.notes ?? null,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
});

router.patch("/admin/orders/:id/hide", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  await db
    .update(ordersTable)
    .set({ hiddenAt: new Date() })
    .where(eq(ordersTable.id, id));

  res.json({ success: true });
});

export default router;
