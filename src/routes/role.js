import express from 'express';
import { createRole, getAllRole } from '../controllers/role.js';
import { authenticate } from '../middlewares/authMiddleware.js';
const roleRouter = express.Router();


roleRouter.post('/', authenticate, createRole)

roleRouter.get('/', authenticate, getAllRole)

    
export default roleRouter;