import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import equbRouter from "./routes/equb.route.js";
import participantRouter from "./routes/participant.route.js";
import ratingRouter from "./routes/rating.route.js";
import complaintRouter from "./routes/complaint.route.js";
import attendanceRouter from "./routes/attendance.route.js";
import announcementRouter from "./routes/announcement.route.js";
import cycleRouter from "./routes/cycle.route.js";
import winnerRouter from "./routes/winner.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log(err));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/equb", equbRouter);
app.use("/api/participant", participantRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/complaint", complaintRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/announcement", announcementRouter);
app.use("/api/cycle", cycleRouter);
app.use("/api/winner", winnerRouter);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
