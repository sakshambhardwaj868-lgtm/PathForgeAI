import { Response } from 'express';
import { SavedRoadmap } from '../models/SavedRoadmap';
import { RoadmapShare } from '../models/RoadmapShare';
import { Database } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { updateProgressSchema } from '../schemas/authSchemas';

export class RoadmapPersistenceController {
  public static async saveRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected. Cloud persistence is unavailable.',
      });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to save roadmaps to cloud.',
      });
      return;
    }

    const roadmapData = req.body;
    if (!roadmapData || !roadmapData.targetRole || !Array.isArray(roadmapData.milestones)) {
      res.status(400).json({
        success: false,
        error: 'Invalid roadmap payload. targetRole and milestones array are required.',
      });
      return;
    }

    const roadmapId = roadmapData.roadmapId || roadmapData.id || `rm-${Date.now()}`;

    try {
      // Find existing roadmap owned by this user
      let savedDoc = await SavedRoadmap.findOne({
        userId,
        roadmapId,
      });

      if (savedDoc) {
        // Update existing document
        savedDoc.targetRole = roadmapData.targetRole;
        savedDoc.targetCompanyType = roadmapData.targetCompanyType || savedDoc.targetCompanyType;
        savedDoc.experienceLevel = roadmapData.experienceLevel || savedDoc.experienceLevel;
        savedDoc.weeklyCommitmentHours = roadmapData.weeklyCommitmentHours || savedDoc.weeklyCommitmentHours;
        savedDoc.totalEstimatedWeeks = roadmapData.totalEstimatedWeeks || savedDoc.totalEstimatedWeeks;
        savedDoc.source = roadmapData.source || savedDoc.source;
        savedDoc.phases = roadmapData.phases || savedDoc.phases;
        savedDoc.intermediateRoles = roadmapData.intermediateRoles || savedDoc.intermediateRoles;
        savedDoc.milestones = roadmapData.milestones;
        savedDoc.edges = roadmapData.edges || savedDoc.edges;
        savedDoc.metrics = roadmapData.metrics || savedDoc.metrics;

        await savedDoc.save();

        res.status(200).json({
          success: true,
          message: 'Roadmap progress updated in cloud storage.',
          data: savedDoc,
        });
      } else {
        // Create new document (first write creates database/collection if not yet initialized)
        savedDoc = await SavedRoadmap.create({
          userId,
          roadmapId,
          targetRole: roadmapData.targetRole,
          targetCompanyType: roadmapData.targetCompanyType || 'Tech Company',
          experienceLevel: roadmapData.experienceLevel || 'Beginner',
          weeklyCommitmentHours: roadmapData.weeklyCommitmentHours || 15,
          totalEstimatedWeeks: roadmapData.totalEstimatedWeeks || 12,
          source: roadmapData.source || 'live_ai',
          phases: roadmapData.phases || [],
          intermediateRoles: roadmapData.intermediateRoles || [],
          milestones: roadmapData.milestones || [],
          edges: roadmapData.edges || [],
          metrics: roadmapData.metrics || {},
        });

        res.status(201).json({
          success: true,
          message: 'Roadmap saved to cloud storage.',
          data: savedDoc,
        });
      }
    } catch (err: any) {
      console.error('[RoadmapPersistenceController.saveRoadmap] Error saving roadmap:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to persist roadmap in database.',
      });
    }
  }

  public static async getMyRoadmaps(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected.',
      });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    try {
      const roadmaps = await SavedRoadmap.find({ userId }).sort({ updatedAt: -1 });

      res.status(200).json({
        success: true,
        count: roadmaps.length,
        data: roadmaps,
      });
    } catch (err: any) {
      console.error('[RoadmapPersistenceController.getMyRoadmaps] Error fetching roadmaps:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve saved roadmaps.',
      });
    }
  }

  public static async getRoadmapById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected.',
      });
      return;
    }

    const userId = req.user?.userId;
    const roadmapId = req.params.id;

    try {
      const isObjectId = Boolean(roadmapId.match(/^[0-9a-fA-F]{24}$/));
      const idOrFilter = [{ roadmapId }, ...(isObjectId ? [{ _id: roadmapId }] : [])];

      // 1. First look for roadmap owned by the authenticated user
      let roadmap = userId
        ? await SavedRoadmap.findOne({
            userId,
            $or: idOrFilter,
          })
        : null;

      // 2. If not found under this user, query globally to check if it exists under another user
      // so the 403 ownership check can properly trigger
      if (!roadmap) {
        roadmap = await SavedRoadmap.findOne({
          $or: idOrFilter,
        });
      }

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: 'Roadmap not found.',
        });
        return;
      }

      // Enforce Ownership Authorization
      if (!userId || roadmap.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to access this private roadmap.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (err: any) {
      console.error('[RoadmapPersistenceController.getRoadmapById] Error fetching roadmap:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve roadmap.',
      });
    }
  }

  public static async updateMilestoneProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected.',
      });
      return;
    }

    const userId = req.user?.userId;
    const roadmapId = req.params.id;

    const validation = updateProgressSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid progress update data.',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { milestoneId, isKnown } = validation.data;

    try {
      const isObjectId = Boolean(roadmapId.match(/^[0-9a-fA-F]{24}$/));
      const idOrFilter = [{ roadmapId }, ...(isObjectId ? [{ _id: roadmapId }] : [])];

      let roadmap = userId
        ? await SavedRoadmap.findOne({
            userId,
            $or: idOrFilter,
          })
        : null;

      if (!roadmap) {
        roadmap = await SavedRoadmap.findOne({
          $or: idOrFilter,
        });
      }

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: 'Roadmap not found.',
        });
        return;
      }

      // Enforce Ownership Authorization
      if (!userId || roadmap.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You cannot modify roadmaps owned by another user.',
        });
        return;
      }

      // Find and update the milestone inside the array
      const milestone = roadmap.milestones.find((m: any) => m.id === milestoneId);
      if (!milestone) {
        res.status(404).json({
          success: false,
          error: `Milestone "${milestoneId}" not found in this roadmap.`,
        });
        return;
      }

      milestone.isKnown = isKnown;
      milestone.status = isKnown ? 'completed' : 'available';

      roadmap.markModified('milestones');
      await roadmap.save();

      res.status(200).json({
        success: true,
        message: 'Milestone progress updated.',
        data: roadmap,
      });
    } catch (err: any) {
      console.error('[RoadmapPersistenceController.updateMilestoneProgress] Error updating progress:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to update milestone progress.',
      });
    }
  }

  public static async deleteRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected.',
      });
      return;
    }

    const userId = req.user?.userId;
    const roadmapId = req.params.id;

    try {
      const isObjectId = Boolean(roadmapId.match(/^[0-9a-fA-F]{24}$/));
      const idOrFilter = [{ roadmapId }, ...(isObjectId ? [{ _id: roadmapId }] : [])];

      let roadmap = userId
        ? await SavedRoadmap.findOne({
            userId,
            $or: idOrFilter,
          })
        : null;

      if (!roadmap) {
        roadmap = await SavedRoadmap.findOne({
          $or: idOrFilter,
        });
      }

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: 'Roadmap not found.',
        });
        return;
      }

      // Enforce Ownership Authorization
      if (!userId || roadmap.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You cannot delete roadmaps owned by another user.',
        });
        return;
      }

      // Cascade delete any shares created for this roadmap
      if (roadmap._id) {
        await RoadmapShare.deleteMany({ roadmapId: roadmap._id }).catch((e) => {
          console.warn('[RoadmapPersistenceController.deleteRoadmap] Non-fatal error cleaning shares:', e);
        });
      }

      await roadmap.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Roadmap successfully deleted.',
      });
    } catch (err: any) {
      console.error('[RoadmapPersistenceController.deleteRoadmap] Error deleting roadmap:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to delete roadmap.',
      });
    }
  }
}
