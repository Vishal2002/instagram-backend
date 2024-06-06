import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './route/route';
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user/v1',userRouter);


const port:string =process.env.PORT ||'3000';

app.listen(port,()=>{console.log(`listening on port ${port}`)});