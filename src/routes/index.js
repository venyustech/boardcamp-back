import { Router } from "express";
import categoriesRouters from "./categoriesRoutes.js";
import gamesRouters from "./gamesRouters.js";

const router = Router();

router.use(categoriesRouters);
router.use(gamesRouters);

export default router;