import express from 'express';
import { config } from 'dotenv';
import userRouter from './routes/user.js';
import communityRouter from './routes/community.js';
import memberRouter from './routes/member.js';
import roleRouter from './routes/role.js';
import { DBconnection } from './utils/features.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
config();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/v1/auth', userRouter);
app.use('/v1/community', communityRouter);
app.use('/v1/member', memberRouter);
app.use('/v1/role', roleRouter);

DBconnection();

app.get('/', function (req, res) {
  res.send('Hello from the server!')
})


app.listen(process.env.PORT || 4000, () => {
    console.log('server started');
});
