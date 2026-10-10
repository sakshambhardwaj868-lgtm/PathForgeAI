import { Request, Response } from 'express';
import { generateRoadmapRequestSchema } from '../schemas/requestSchemas';
import { AiService } from '../services/aiService';

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
}
