import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO)
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.log(err));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
