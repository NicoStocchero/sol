export interface SearchMatch {
  text: string;
  position: number;
  section?: string;
}

export interface SearchResult {
  docId: string;
  docTitle: string;
  docIcon: string;
  matches: SearchMatch[];
  totalMatches: number;
}

export function searchInDocuments(
  query: string,
  documents: { id: string; title: string; icon: string; content: string }[]
): SearchResult[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const doc of documents) {
    const content = doc.content.toLowerCase();
    const matches: SearchMatch[] = [];

    // Find all occurrences
    let position = 0;
    while (true) {
      const index = content.indexOf(normalizedQuery, position);
      if (index === -1) break;

      // Extract snippet with context (80 chars before and after)
      const start = Math.max(0, index - 80);
      const end = Math.min(content.length, index + normalizedQuery.length + 80);
      let snippet = doc.content.slice(start, end);

      // Add ellipsis if we cut the text
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';

      // Find nearby header (section)
      const beforeText = doc.content.slice(0, index);
      const headerMatch = beforeText.match(/#{1,4}\s+([^\n]+)\n[^#]*$/);
      const section = headerMatch ? headerMatch[1].trim() : undefined;

      matches.push({
        text: snippet,
        position: index,
        section,
      });

      position = index + 1;

      // Limit to 5 matches per document
      if (matches.length >= 5) break;
    }

    if (matches.length > 0) {
      // Count total matches
      const totalMatches = (content.match(new RegExp(normalizedQuery, 'g')) || []).length;

      results.push({
        docId: doc.id,
        docTitle: doc.title,
        docIcon: doc.icon,
        matches,
        totalMatches,
      });
    }
  }

  // Sort by total matches (descending)
  return results.sort((a, b) => b.totalMatches - a.totalMatches);
}

export interface HighlightPart {
  type: 'text' | 'highlight';
  content: string;
}

export function highlightMatch(text: string, query: string): HighlightPart[] {
  if (!query) return [{ type: 'text', content: text }];

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter(part => part !== '')
    .map((part): HighlightPart => {
      if (regex.test(part)) {
        regex.lastIndex = 0; // Reset regex state
        return { type: 'highlight', content: part };
      }
      return { type: 'text', content: part };
    });
}
