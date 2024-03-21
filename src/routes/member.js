import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { addMember, deleteMember } from '../controllers/member.js';

const memberRouter = express.Router();


memberRouter.post('/',authenticate, addMember)

memberRouter.delete('/:id', authenticate, deleteMember)


export default memberRouter;