import { Router } from "express";
import { healthCheck } from "./health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is healthy
 */

router.get('/', healthCheck);

export default router;