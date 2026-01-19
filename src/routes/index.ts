
import { Router } from "express";
import { genRouter } from "./deprecated.routes.js";

const router = Router();

router.use("/", genRouter);

export default router;
