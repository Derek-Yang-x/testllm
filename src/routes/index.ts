
import { Router } from "express";
import { genRouter } from "./deprecated.routes.js";


import generatedRoutes from "../generated/routes/index.js";

const router = Router();

router.use("/", genRouter);
router.use("/api", generatedRoutes);

export default router;
