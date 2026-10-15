import { Request, Response } from 'express';
import { generateRoadmapRequestSchema } from '../schemas/requestSchemas';
import { AiService } from '../services/aiService';
import { FallbackService } from '../services/fallbackService';

export class RoadmapController {
  /**
   * POST /api/v1/roadmap/generate
   * Generates a validated career roadmap DAG based on user target parameters.
   */
  public static async generate(req: Request, res: Response): Promise<void> {
    const parseResult = generateRoadmapRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorDetails: Record<string, string[]> = {};
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.') || 'body';
        if (!errorDetails[field]) errorDetails[field] = [];
        errorDetails[field].push(err.message);
      });

      res.status(400).json({
        success: false,
        error: 'Invalid roadmap request parameters.',
        details: errorDetails,
      });
      return;
    }

    try {
      const startTime = Date.now();
      const roadmap = await AiService.generateRoadmap(parseResult.data);
      const durationMs = Date.now() - startTime;

      res.setHeader('X-Response-Time-Ms', durationMs.toString());
      res.setHeader('X-Roadmap-Source', roadmap.source);
      if (roadmap.modelUsed) {
        res.setHeader('X-Roadmap-Model', roadmap.modelUsed);
      }

      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (err: any) {
      console.error('[RoadmapController] Generation error:', err);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred while synthesizing the career roadmap.',
      });
    }
  }

  /**
   * GET /api/v1/roadmap/fallback or POST /api/v1/roadmap/fallback
   * Immediately returns verified offline fallback roadmap without calling Gemini.
   */
  public static async getFallback(req: Request, res: Response): Promise<void> {
    try {
      const role =
        (typeof req.query.role === 'string' && req.query.role) ||
        (typeof req.body?.targetRole === 'string' && req.body.targetRole) ||
        (req.body?.targetRole ? String(req.body.targetRole) : '') ||
        'Full Stack Developer at a Climate Tech Startup';
      const hours = Number(req.query.hours || req.body?.weeklyCommitmentHours) || 15;
      const level =
        (req.query.level as any) ||
        (req.body?.experienceLevel as any) ||
        'Beginner';

      const roadmap = FallbackService.getFallbackRoadmap(role, hours, level);

      res.setHeader('X-Roadmap-Source', 'cached_fallback');
      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (err: any) {
      console.error('[RoadmapController] Fallback error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve offline fallback roadmap.',
      });
    }
  }
}
