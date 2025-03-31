import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import equbRouter from './routes/equb.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO)
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.log(err));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/equb', equbRouter);

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
