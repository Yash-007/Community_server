import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getMe, signIn, signUp } from '../controllers/user.js';
const userRouter = express.Router();


userRouter.post('/signup', signUp)

userRouter.post('/signin', signIn)

userRouter.get('/me', authenticate, getMe)

    

export default userRouter;