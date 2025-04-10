import express from "express";
import { createEqub, getEqubs, getMyEqubs } from "../controllers/equb.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-equb",verifyToken, createEqub);
router.get("/get-equbs", verifyToken, getEqubs);
router.get("/my-equbs", verifyToken, getMyEqubs);

export default router;