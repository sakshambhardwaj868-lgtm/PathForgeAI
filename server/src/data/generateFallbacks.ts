import fs from 'fs';
import path from 'path';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';
import { climateTechRoadmap } from './climateTechRoadmapData';
import { fintechUxRoadmap } from './fintechUxRoadmapData';
import { aiEngineerRoadmap } from './aiEngineerRoadmapData';

function generateAndSaveFallbacks() {
  console.log('--- PathForge AI: Generating & Validating Rich Curriculum Fallback Datasets ---');

  const datasets = [
    { name: 'climate-tech.json', data: climateTechRoadmap },
    { name: 'fintech-ux.json', data: fintechUxRoadmap },
    { name: 'ai-engineer.json', data: aiEngineerRoadmap },
  ];

  const serverFallbacksDir = path.join(__dirname, 'fallbacks');
  const clientFallbacksDir = path.resolve(__dirname, '../../../client/src/data/fallbacks');

  if (!fs.existsSync(serverFallbacksDir)) fs.mkdirSync(serverFallbacksDir, { recursive: true });
  if (!fs.existsSync(clientFallbacksDir)) fs.mkdirSync(clientFallbacksDir, { recursive: true });

  for (const { name, data } of datasets) {
    console.log(`\nValidating ${name} with ${data.milestones.length} milestones...`);
    const validation = validateAndSanitizeRoadmap(data, 'cached_fallback');

    if (!validation.success) {
      console.error(`FAILED to validate ${name}:`, validation.errors);
      process.exit(1);
    }

    const validatedData = validation.data;
    console.log(`  [VALIDATED] ${name}:`);
    console.log(`    - Milestones: ${validatedData.milestones.length}`);
    console.log(`    - Edges: ${validatedData.edges.length}`);
    console.log(`    - Total Weeks: ${validatedData.totalEstimatedWeeks}`);
    console.log(`    - Weekly Hours: ${validatedData.weeklyCommitmentHours}`);

    const jsonStr = JSON.stringify(validatedData, null, 2);

    const serverPath = path.join(serverFallbacksDir, name);
    fs.writeFileSync(serverPath, jsonStr, 'utf-8');
    console.log(`    -> Written to server: ${serverPath}`);

    const clientPath = path.join(clientFallbacksDir, name);
    fs.writeFileSync(clientPath, jsonStr, 'utf-8');
    console.log(`    -> Written to client: ${clientPath}`);
  }

  console.log('\nAll 3 rich fallback datasets successfully generated, validated, and saved!');
}

generateAndSaveFallbacks();
