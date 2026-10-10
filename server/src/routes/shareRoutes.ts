import { Router } from 'express';
import { RoadmapShareController } from '../controllers/roadmapShareController';
import { publicShareLimiter } from '../middleware/rateLimiter';

export const shareRouter = Router();

// Public endpoint to retrieve a roadmap by its cryptographically secure share token
shareRouter.get('/:token', publicShareLimiter, RoadmapShareController.getPublicSharedRoadmap);
