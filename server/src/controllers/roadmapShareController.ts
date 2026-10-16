import { Request, Response } from 'express';
import { Database } from '../config/db';
import { env } from '../config/env';
import { SavedRoadmap } from '../models/SavedRoadmap';
import { User } from '../models/User';
import { RoadmapShare } from '../models/RoadmapShare';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createShareSchema, shareTokenParamSchema } from '../schemas/shareSchemas';
import { generateSecureShareToken, hashShareToken } from '../utils/cryptoUtils';

export class RoadmapShareController {
  /**
   * Create a new secure share link for an owned roadmap.
   * POST /api/v1/roadmaps/:id/shares
   */
  public static async createShareLink(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database is not connected. Share creation is unavailable.',
      });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to create shareable links.',
      });
      return;
    }

    const roadmapIdentifier = req.params.id;
    if (!roadmapIdentifier || roadmapIdentifier === 'undefined') {
      res.status(400).json({
        success: false,
        error: 'Roadmap ID parameter is required.',
      });
      return;
    }

    const isObjectId = Boolean(roadmapIdentifier.match(/^[0-9a-fA-F]{24}$/));
    const idOrFilter = [
      { roadmapId: roadmapIdentifier },
      ...(isObjectId ? [{ _id: roadmapIdentifier }] : []),
    ];

    // 1. Locate roadmap by MongoDB _id or custom roadmapId (scoped to owner first)
    let roadmap;
    try {
      roadmap = await SavedRoadmap.findOne({
        userId,
        $or: idOrFilter,
      });

      // If not found under this user, query globally to allow 403 Forbidden check to trigger
      if (!roadmap) {
        roadmap = await SavedRoadmap.findOne({
          $or: idOrFilter,
        });
      }
    } catch (err: any) {
      console.error('[RoadmapShareController.createShareLink] DB lookup error:', err);
      res.status(500).json({
        success: false,
        error: 'Error looking up roadmap.',
      });
      return;
    }

    if (!roadmap) {
      res.status(404).json({
        success: false,
        error: 'Roadmap not found.',
      });
      return;
    }

    // 2. Enforce Ownership Authorization: User A cannot share User B's roadmap
    if (roadmap.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only create share links for your own roadmaps.',
      });
      return;
    }

    // 3. Validate request payload (expiresInDays, label)
    const validation = createShareSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid share configuration.',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { expiresInDays, label } = validation.data;

    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // 4. Generate cryptographically unpredictable token & compute SHA-256 hash
    const rawToken = generateSecureShareToken();
    const tokenHash = hashShareToken(rawToken);
    const tokenPrefix = `pfg_${rawToken.slice(0, 8)}`;

    try {
      const shareDoc = await RoadmapShare.create({
        roadmapId: roadmap._id,
        userId: roadmap.userId,
        tokenHash,
        tokenPrefix,
        label: label || 'Shared Career Roadmap',
        expiresAt,
        isRevoked: false,
      });

      // Construct public URL using configured CLIENT_ORIGIN
      const clientOrigin = env.CLIENT_ORIGIN || 'http://localhost:5173';
      const shareUrl = `${clientOrigin.replace(/\/+$/, '')}/share/${rawToken}`;

      res.status(201).json({
        success: true,
        message: 'Share link created successfully.',
        data: {
          id: shareDoc._id.toString(),
          shareUrl,
          tokenPrefix: shareDoc.tokenPrefix,
          label: shareDoc.label,
          expiresAt: shareDoc.expiresAt ? shareDoc.expiresAt.toISOString() : null,
          createdAt: shareDoc.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[RoadmapShareController.createShareLink] Failed to persist share record:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to create share link.',
      });
    }
  }

  /**
   * List all share links for a given roadmap owned by the authenticated user.
   * GET /api/v1/roadmaps/:id/shares
   */
  public static async getSharesForRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const roadmapIdentifier = req.params.id;
    if (!roadmapIdentifier || roadmapIdentifier === 'undefined') {
      res.status(400).json({
        success: false,
        error: 'Roadmap ID parameter is required.',
      });
      return;
    }

    const isObjectId = Boolean(roadmapIdentifier.match(/^[0-9a-fA-F]{24}$/));
    const idOrFilter = [
      { roadmapId: roadmapIdentifier },
      ...(isObjectId ? [{ _id: roadmapIdentifier }] : []),
    ];

    try {
      let roadmap = await SavedRoadmap.findOne({
        userId,
        $or: idOrFilter,
      });

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

      // Enforce Ownership
      if (roadmap.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to view share links for this roadmap.',
        });
        return;
      }

      const shares = await RoadmapShare.find({
        roadmapId: roadmap._id,
        userId,
      }).sort({ createdAt: -1 });

      const clientOrigin = env.CLIENT_ORIGIN || 'http://localhost:5173';

      const summaries = shares.map((s) => ({
        id: s._id.toString(),
        tokenPrefix: s.tokenPrefix,
        label: s.label,
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
        isRevoked: s.isRevoked,
        revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
        viewCount: s.viewCount || 0,
        createdAt: s.createdAt.toISOString(),
      }));

      res.status(200).json({
        success: true,
        count: summaries.length,
        data: summaries,
      });
    } catch (err: any) {
      console.error('[RoadmapShareController.getSharesForRoadmap] Error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve share links.',
      });
    }
  }

  /**
   * Revoke an active share link.
   * DELETE /api/v1/roadmaps/:id/shares/:shareId
   */
  public static async revokeShareLink(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id: roadmapIdentifier, shareId } = req.params;
    if (!roadmapIdentifier || roadmapIdentifier === 'undefined') {
      res.status(400).json({
        success: false,
        error: 'Roadmap ID parameter is required.',
      });
      return;
    }

    const isObjectId = Boolean(roadmapIdentifier.match(/^[0-9a-fA-F]{24}$/));
    const idOrFilter = [
      { roadmapId: roadmapIdentifier },
      ...(isObjectId ? [{ _id: roadmapIdentifier }] : []),
    ];

    try {
      let roadmap = await SavedRoadmap.findOne({
        userId,
        $or: idOrFilter,
      });

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

      if (roadmap.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You cannot modify share links for another user\'s roadmap.',
        });
        return;
      }

      const share = await RoadmapShare.findOne({
        _id: shareId,
        roadmapId: roadmap._id,
      });

      if (!share) {
        res.status(404).json({
          success: false,
          error: 'Share link not found.',
        });
        return;
      }

      if (share.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You do not own this share link.',
        });
        return;
      }

      share.isRevoked = true;
      share.revokedAt = new Date();
      await share.save();

      res.status(200).json({
        success: true,
        message: 'Share link successfully revoked.',
      });
    } catch (err: any) {
      console.error('[RoadmapShareController.revokeShareLink] Error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke share link.',
      });
    }
  }

  /**
   * Retrieve a roadmap by its public share token.
   * GET /api/v1/shares/:token
   * Public: No authentication required.
   */
  public static async getPublicSharedRoadmap(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    // 1. Validate token format (64-character hexadecimal)
    const tokenValidation = shareTokenParamSchema.safeParse({ token });
    if (!tokenValidation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid share link format. Please verify the URL.',
      });
      return;
    }

    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Roadmap sharing service is temporarily unavailable. Please try again later.',
      });
      return;
    }

    // 2. Hash token to perform constant-time secure DB lookup
    const tokenHash = hashShareToken(token);

    try {
      const share = await RoadmapShare.findOne({ tokenHash });

      if (!share) {
        res.status(404).json({
          success: false,
          error: 'Share link not found or has been removed.',
        });
        return;
      }

      // 3. Check revocation status
      if (share.isRevoked) {
        res.status(410).json({
          success: false,
          error: 'This roadmap share link has been revoked by its owner.',
          isRevoked: true,
        });
        return;
      }

      // 4. Check expiration status
      if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
        res.status(410).json({
          success: false,
          error: 'This roadmap share link has expired.',
          isExpired: true,
        });
        return;
      }

      // 5. Retrieve associated roadmap
      const roadmap = await SavedRoadmap.findById(share.roadmapId);
      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: 'The shared roadmap no longer exists or was deleted by its owner.',
        });
        return;
      }

      // 6. Asynchronously track view count without blocking response
      RoadmapShare.updateOne({ _id: share._id }, { $inc: { viewCount: 1 } }).exec().catch(() => {});

      // 7. Retrieve owner's public name only (NEVER expose email, passwordHash, etc.)
      const owner = await User.findById(share.userId).select('name');
      const ownerDisplayName = owner?.name?.trim() || 'PathForge AI Explorer';

      // 8. Explicitly sanitize roadmap payload to approved public fields only
      const sanitizedRoadmap = {
        id: roadmap.roadmapId,
        targetRole: roadmap.targetRole,
        targetCompanyType: roadmap.targetCompanyType,
        experienceLevel: roadmap.experienceLevel,
        weeklyCommitmentHours: roadmap.weeklyCommitmentHours,
        totalEstimatedWeeks: roadmap.totalEstimatedWeeks,
        source: roadmap.source,
        phases: roadmap.phases,
        intermediateRoles: roadmap.intermediateRoles,
        milestones: roadmap.milestones,
        edges: roadmap.edges,
        metrics: roadmap.metrics,
        createdAt: roadmap.createdAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: {
          shareInfo: {
            label: share.label,
            ownerName: ownerDisplayName,
            createdAt: share.createdAt.toISOString(),
            expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
          },
          roadmap: sanitizedRoadmap,
        },
      });
    } catch (err: any) {
      console.error('[RoadmapShareController.getPublicSharedRoadmap] Error retrieving shared roadmap:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve shared roadmap.',
      });
    }
  }
}
