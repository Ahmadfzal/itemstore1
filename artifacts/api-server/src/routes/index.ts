import { Router, type IRouter } from "express";
import healthRouter from "./health";
import packagesRouter from "./packages";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(packagesRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(settingsRouter);

export default router;
