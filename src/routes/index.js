import { Router } from "express";
import categoriesRouters from "./categoriesRoutes.js";

const router = Router();

router.use(categoriesRouters);

export default router;