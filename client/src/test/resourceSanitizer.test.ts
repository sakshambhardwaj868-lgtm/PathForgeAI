import { describe, it, expect } from 'vitest';
import { sanitizeResource } from '../utils/resourceSanitizer';

describe('Resource Sanitizer & Safe Link Verification', () => {
  it('identifies and verifies official documentation domains', () => {
    const officialDoc = {
      title: 'Python Xarray Documentation',
      type: 'documentation' as const,
      searchQueryOrUrl: 'https://docs.python.org/3/library/multiprocessing.html',
      description: 'Official Python standard library documentation',
    };

    const sanitized = sanitizeResource(officialDoc);

    expect(sanitized.isVerifiedOfficial).toBe(true);
    expect(sanitized.badgeLabel).toBe('Official Documentation');
    expect(sanitized.href).toBe('https://docs.python.org/3/library/multiprocessing.html');
  });

  it('correctly formats and labels curated GitHub search queries', () => {
    const githubQuery = {
      title: 'Carbon Accounting Repositories',
      type: 'github_search' as const,
      searchQueryOrUrl: 'topic:carbon-accounting',
      description: 'Search GitHub for carbon accounting projects',
    };

    const sanitized = sanitizeResource(githubQuery);

    expect(sanitized.isCuratedSearch).toBe(true);
    expect(sanitized.badgeLabel).toBe('Curated GitHub Query');
    expect(sanitized.href).toBe('https://github.com/search?q=topic%3Acarbon-accounting');
    expect(sanitized.displayUrl).toContain('github.com/search');
  });

  it('converts plain search query strings into safe GitHub search links', () => {
    const rawSearch = {
      title: 'PostGIS Spatial Query Guides',
      type: 'tutorial' as const,
      searchQueryOrUrl: 'postgis spatial index optimization',
      description: 'Find optimization guides',
    };

    const sanitized = sanitizeResource(rawSearch);

    expect(sanitized.isCuratedSearch).toBe(true);
    expect(sanitized.badgeLabel).toBe('Curated GitHub Query');
    expect(sanitized.href).toContain('https://github.com/search?q=postgis');
  });

  it('safely converts malformed URLs into safe fallback search queries instead of crashing', () => {
    const malformed = {
      title: 'Broken Resource',
      type: 'documentation' as const,
      searchQueryOrUrl: 'http://not a valid url:::invalid',
      description: 'Malformed link',
    };

    const sanitized = sanitizeResource(malformed);

    expect(sanitized.isCuratedSearch).toBe(true);
    expect(sanitized.badgeLabel).toBe('Search Link (Safe Fallback)');
    expect(sanitized.href).toContain('https://github.com/search?q=');
  });

  it('falls back to default title and description when fields are missing', () => {
    const emptyResource = {
      title: '',
      type: 'documentation' as const,
      searchQueryOrUrl: '',
      description: '',
    };

    const sanitized = sanitizeResource(emptyResource);

    expect(sanitized.title).toBe('Resource Guide');
    expect(sanitized.description).toBe('Recommended resource for this milestone.');
    expect(sanitized.href).toContain('https://github.com/search?q=');
  });
});
