import { describe, it, expect } from 'vitest';
import { getLayoutedRoadmap } from '../utils/dagreLayout';
import { CareerRoadmap } from '../types/roadmap';

// Real Phase 2 verified dataset structures
const climateRoadmap: CareerRoadmap = {
  id: 'roadmap-climate-test',
  targetRole: 'Full Stack Developer at a Climate Tech Startup',
  targetCompanyType: 'Renewable Energy Series-A',
  experienceLevel: 'Beginner',
  weeklyCommitmentHours: 15,
  totalEstimatedWeeks: 12,
  source: 'cached_fallback',
  phases: [
    { id: 'phase-1', title: 'Phase 1: Climate Domain & Scientific Stack', description: 'Foundations', order: 1 },
    { id: 'phase-2', title: 'Phase 2: Modern Real-Time Web Platform', description: 'Web Core', order: 2 },
    { id: 'phase-3', title: 'Phase 3: Production IoT Ingestion & Decarbonization Capstone', description: 'Capstone', order: 3 },
  ],
  intermediateRoles: [
    { title: 'Junior Climate Data Analyst', estimatedTimelineMonth: 3, description: 'Analyze feeds' },
  ],
  milestones: [
    {
      id: 'ms-climate-1',
      title: 'Scientific Python, Xarray & NetCDF4 Ingestion',
      category: 'foundation',
      phaseId: 'phase-1',
      estimatedHours: 25,
      prerequisiteIds: [],
      status: 'available',
      isKnown: false,
      actionableData: {
        learningObjectives: ['NetCDF data structure', 'Rasterio geospatial pipelines'],
        weekendProject: {
          title: 'Satellite Wildfire Smoke Plume Pipeline',
          description: 'Parse GOES-16 netcdf feeds',
          deliverables: ['CLI ingestion pipeline', 'GeoJSON exporter'],
          estimatedHours: 14,
        },
        curatedResources: [
          {
            title: 'Earth Data Python Guides',
            type: 'documentation',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Aearth-observation+language%3Apython',
            description: 'Scientific pipelines',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why is Xarray preferred over pandas for satellite imagery?',
            idealAnswerKey: 'Xarray supports multidimensional labeled arrays (tensors) with spatial/temporal coordinates.',
            difficulty: 'Medium',
          },
        ],
      },
    },
    {
      id: 'ms-climate-2',
      title: 'Geospatial Web Services with PostGIS & MapLibre GL',
      category: 'core-skill',
      phaseId: 'phase-2',
      estimatedHours: 30,
      prerequisiteIds: ['ms-climate-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        learningObjectives: ['Vector tile generation', 'PostGIS spatial queries'],
        weekendProject: {
          title: 'Interactive Carbon Grid Map',
          description: 'Render sub-station power generation',
          deliverables: ['MapLibre UI component', 'FastAPI GeoJSON endpoint'],
          estimatedHours: 16,
        },
        curatedResources: [],
        interviewChallenges: [],
      },
    },
    {
      id: 'ms-climate-3',
      title: 'TimescaleDB & IoT Sensor Ingestion Engine',
      category: 'tooling',
      phaseId: 'phase-2',
      estimatedHours: 20,
      prerequisiteIds: ['ms-climate-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        learningObjectives: ['Hypertables and continuous aggregates'],
        weekendProject: {
          title: 'Smart Solar Inverter Telemetry Logger',
          description: 'MQTT to TimescaleDB ingestion',
          deliverables: ['MQTT consumer', 'Grafana dashboard config'],
          estimatedHours: 12,
        },
        curatedResources: [],
        interviewChallenges: [],
      },
    },
    {
      id: 'ms-climate-4',
      title: 'Grid Decarbonization & Clean Energy Arbitrage Engine',
      category: 'capstone',
      phaseId: 'phase-3',
      estimatedHours: 35,
      prerequisiteIds: ['ms-climate-2', 'ms-climate-3'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        learningObjectives: ['CAISO/ERCOT marginal emissions', 'Battery arbitrage optimization'],
        weekendProject: {
          title: 'Automated Battery Dispatch Simulator',
          description: 'Simulates 5MW battery arbitrage',
          deliverables: ['Full-stack dashboard', 'Arbitrage optimization engine'],
          estimatedHours: 18,
        },
        curatedResources: [],
        interviewChallenges: [],
      },
    },
  ],
  edges: [
    { id: 'edge-1-2', source: 'ms-climate-1', target: 'ms-climate-2' },
    { id: 'edge-1-3', source: 'ms-climate-1', target: 'ms-climate-3' },
    { id: 'edge-2-4', source: 'ms-climate-2', target: 'ms-climate-4' },
    { id: 'edge-3-4', source: 'ms-climate-3', target: 'ms-climate-4' },
  ],
  createdAt: new Date().toISOString(),
};

describe('Phase 2 to Phase 3 Integration Verification', () => {
  it('correctly ingests Phase 2 roadmap data into React Flow nodes and edges', () => {
    const layout = getLayoutedRoadmap(climateRoadmap);

    expect(layout.nodes.length).toBe(4);
    expect(layout.edges.length).toBe(4);

    const nodeIds = layout.nodes.map((n) => n.id);
    expect(nodeIds).toContain('ms-climate-1');
    expect(nodeIds).toContain('ms-climate-2');
    expect(nodeIds).toContain('ms-climate-3');
    expect(nodeIds).toContain('ms-climate-4');

    // Confirm that every edge connects valid nodes
    layout.edges.forEach((edge) => {
      expect(nodeIds).toContain(edge.source);
      expect(nodeIds).toContain(edge.target);
    });
  });

  it('preserves branching (ms-1 -> ms-2, ms-3) and converging (ms-2, ms-3 -> ms-4) DAG topology', () => {
    const layout = getLayoutedRoadmap(climateRoadmap, { direction: 'TB' });

    const n1 = layout.nodes.find((n) => n.id === 'ms-climate-1')!;
    const n2 = layout.nodes.find((n) => n.id === 'ms-climate-2')!;
    const n3 = layout.nodes.find((n) => n.id === 'ms-climate-3')!;
    const n4 = layout.nodes.find((n) => n.id === 'ms-climate-4')!;

    // n1 is root
    expect(n2.position.y).toBeGreaterThan(n1.position.y);
    expect(n3.position.y).toBeGreaterThan(n1.position.y);

    // n2 and n3 are parallel branches and have different horizontal X coordinates
    expect(n2.position.x).not.toEqual(n3.position.x);

    // n4 converges below both n2 and n3
    expect(n4.position.y).toBeGreaterThan(n2.position.y);
    expect(n4.position.y).toBeGreaterThan(n3.position.y);
  });

  it('assigns active animation to edges where target milestone is available', () => {
    // Modify climateRoadmap so ms-climate-2 is available
    const modifiedRoadmap: CareerRoadmap = {
      ...climateRoadmap,
      milestones: climateRoadmap.milestones.map((m) =>
        m.id === 'ms-climate-2' ? { ...m, status: 'available' } : m
      ),
    };

    const layout = getLayoutedRoadmap(modifiedRoadmap);
    const edgeToAvailable = layout.edges.find((e) => e.target === 'ms-climate-2');

    expect(edgeToAvailable?.animated).toBe(true);
    expect(edgeToAvailable?.style?.stroke).toBe('#06b6d4'); // cyan highlight
  });
});
