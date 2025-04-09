import express from 'express';
import { loggedMiddleware } from '../middlewares/authMiddlewares.js';
import { isAdmin } from '../middlewares/roleMiddlewares.js';
import { getCounts } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/counts', loggedMiddleware, isAdmin, getCounts);

export default router;
