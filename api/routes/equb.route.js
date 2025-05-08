import express from "express";
import { createEqub, deleteEqub, getEqub, getEqubs, getJoinedEqubs, getMyEqubs, getUserCreatedEqubs, updateEqub } from "../controllers/equb.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-equb",verifyToken, createEqub);
router.get("/get-equbs", getEqubs);
router.get("/my-equbs", verifyToken, getMyEqubs);
router.get("/joined-equbs", verifyToken, getJoinedEqubs);
router.delete("/:id", verifyToken, deleteEqub);
router.put("/:id", verifyToken, updateEqub);
router.get("/:id", getEqub);
router.get("/created-equbs/:userId", getUserCreatedEqubs);



export default router;