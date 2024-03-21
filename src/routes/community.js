import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { createCommunity, getAllCommunities, getAllMembers, getMyJoinedCommunity, getMyOwnedCommunity } from '../controllers/community.js';

const communityRouter = express.Router();

communityRouter.post('/', authenticate, createCommunity)

communityRouter.get('/', authenticate, getAllCommunities)

communityRouter.get('/me/owner', authenticate, getMyOwnedCommunity)

communityRouter.get('/me/member', authenticate, getMyJoinedCommunity)

communityRouter.get('/:id/members', authenticate, getAllMembers)


export default communityRouter;