import { CuratedResource } from '../types/roadmap';

export interface SanitizedResource {
  title: string;
  displayUrl: string;
  href: string;
  badgeLabel: string;
  badgeColorClass: string;
  isVerifiedOfficial: boolean;
  isCuratedSearch: boolean;
  description: string;
}

/**
 * Known trusted documentation domains.
 */
const TRUSTED_DOC_DOMAINS = [
  'docs.python.org',
  'react.dev',
  'reactjs.org',
  'typescriptlang.org',
  'nodejs.org',
  'developer.mozilla.org',
  'fastapi.tiangolo.com',
  'xarray.dev',
  'postgis.net',
  'timescale.com',
  'docs.docker.com',
  'kubernetes.io',
  'graphql.org',
  'vitest.dev',
  'tailwindcss.com',
  'github.com/search',
];

/**
 * Sanitizes and verifies resource links.
 * Never displays invented URLs as verified. If a link is unverified,
 * converts it into a safe, labeled GitHub/Google search link.
 */
export function sanitizeResource(resource: CuratedResource): SanitizedResource {
  const { title, type, searchQueryOrUrl, description } = resource;

  let safeHref = searchQueryOrUrl?.trim() || '';
  let isVerifiedOfficial = false;
  let isCuratedSearch = false;
  let badgeLabel = 'External Guide';
  let badgeColorClass = 'bg-slate-900 text-slate-300 border-slate-700';

  // Check if it's already an explicit GitHub search query
  if (
    type === 'github_search' ||
    safeHref.includes('github.com/search') ||
    safeHref.startsWith('topic:')
  ) {
    isCuratedSearch = true;
    badgeLabel = 'Curated GitHub Query';
    badgeColorClass = 'bg-purple-950 text-purple-300 border-purple-800';

    if (!safeHref.startsWith('http')) {
      safeHref = `https://github.com/search?q=${encodeURIComponent(safeHref)}`;
    }
  } else if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
    try {
      const urlObj = new URL(safeHref);
      const isTrusted = TRUSTED_DOC_DOMAINS.some((domain) => urlObj.hostname.includes(domain));

      if (isTrusted) {
        isVerifiedOfficial = true;
        badgeLabel = 'Official Documentation';
        badgeColorClass = 'bg-cyan-950 text-cyan-300 border-cyan-800';
      } else {
        badgeLabel = 'Community Resource';
        badgeColorClass = 'bg-blue-950 text-blue-300 border-blue-800';
      }
    } catch {
      // Invalid URL syntax: fall back to safe search link
      safeHref = `https://github.com/search?q=${encodeURIComponent(title || 'programming')}`;
      badgeLabel = 'Search Link (Safe Fallback)';
      badgeColorClass = 'bg-amber-950 text-amber-300 border-amber-800';
      isCuratedSearch = true;
    }
  } else {
    // Plain query string passed instead of full URL: convert to safe GitHub search
    safeHref = `https://github.com/search?q=${encodeURIComponent(safeHref || title)}`;
    badgeLabel = 'Curated GitHub Query';
    badgeColorClass = 'bg-purple-950 text-purple-300 border-purple-800';
    isCuratedSearch = true;
  }

  // Generate clean display URL
  let displayUrl = safeHref;
  try {
    const parsed = new URL(safeHref);
    if (parsed.searchParams.has('q')) {
      displayUrl = `github.com/search?q=${parsed.searchParams.get('q')}`;
    } else {
      displayUrl = parsed.hostname + (parsed.pathname.length > 1 ? parsed.pathname : '');
    }
  } catch {
    displayUrl = safeHref;
  }

  return {
    title: title || 'Resource Guide',
    displayUrl,
    href: safeHref,
    badgeLabel,
    badgeColorClass,
    isVerifiedOfficial,
    isCuratedSearch,
    description: description || 'Recommended resource for this milestone.',
  };
}
