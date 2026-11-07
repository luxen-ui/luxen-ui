import { ref } from 'vue';

/**
 * Query typed in the Design Tokens page filter (`TokenNav`). Shared module
 * state: every `<DesignTokens>` block on the page reads it to narrow its rows.
 */
export const tokenQuery = ref('');

/**
 * Whether a token matches the query: every whitespace-separated term must
 * appear in the token NAME (case-insensitive) — descriptions are ignored, so
 * `form` lists only `--l-form-*` tokens and `border hover` finds
 * `--l-form-control-border-color-hover`.
 */
export function matchesQuery(token, query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const name = token.name.toLowerCase();
  return terms.every((term) => name.includes(term));
}
