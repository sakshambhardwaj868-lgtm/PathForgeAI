import { Router } from 'express';
import { RoadmapPersistenceController } from '../controllers/roadmapPersistenceController';
import { RoadmapShareController } from '../controllers/roadmapShareController';
import { requireAuth } from '../middleware/authMiddleware';
import { createShareLimiter } from '../middleware/rateLimiter';

export const roadmapPersistenceRouter = Router();

// All roadmap persistence routes require authentication
roadmapPersistenceRouter.post('/', requireAuth, RoadmapPersistenceController.saveRoadmap);
roadmapPersistenceRouter.post('/save', requireAuth, RoadmapPersistenceController.saveRoadmap);
roadmapPersistenceRouter.get('/my', requireAuth, RoadmapPersistenceController.getMyRoadmaps);
roadmapPersistenceRouter.get('/:id', requireAuth, RoadmapPersistenceController.getRoadmapById);
roadmapPersistenceRouter.put('/:id/progress', requireAuth, RoadmapPersistenceController.updateMilestoneProgress);
roadmapPersistenceRouter.delete('/:id', requireAuth, RoadmapPersistenceController.deleteRoadmap);

// Secure Roadmap Sharing routes (owner only)
roadmapPersistenceRouter.post('/:id/shares', requireAuth, createShareLimiter, RoadmapShareController.createShareLink);
roadmapPersistenceRouter.get('/:id/shares', requireAuth, RoadmapShareController.getSharesForRoadmap);
roadmapPersistenceRouter.delete('/:id/shares/:shareId', requireAuth, RoadmapShareController.revokeShareLink);

