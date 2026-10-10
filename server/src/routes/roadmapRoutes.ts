import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmapController';

export const roadmapRouter = Router();

// POST /api/v1/roadmap/generate
roadmapRouter.post('/generate', RoadmapController.generate);

// GET & POST /api/v1/roadmap/fallback
roadmapRouter.get('/fallback', RoadmapController.getFallback);
roadmapRouter.post('/fallback', RoadmapController.getFallback);
