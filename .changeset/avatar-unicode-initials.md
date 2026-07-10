---
'luxen-ui': patch
---

Fix `l-avatar` producing wrong initials for accented or non-ASCII names. The fallback initials for a name like "Markus Nösterer" now correctly read "MN" instead of "MS" — the derivation was based on ASCII-only word boundaries (`\b`/`\w`), which treat an accented letter as a word break and split the name mid-word. Initials are now derived by splitting on whitespace and taking the first code point of the first and last words, so accents, umlauts, and other non-ASCII letters are preserved.
