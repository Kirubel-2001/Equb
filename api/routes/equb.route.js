import express from "express";
import { createEqub } from "../controllers/equb.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-equb",verifyToken, createEqub);

export default router;
