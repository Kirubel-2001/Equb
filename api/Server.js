import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO)
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('API Running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
