---
'luxen-ui': minor
---

Broaden the default Agent Skill `description` emitted by `luxen-ui generate-skill` so the skill auto-triggers across the full UI lifecycle — not just greenfield generation. It now mentions building, editing, refactoring, reviewing, and migrating from another component library to Luxen, which fixes the skill silently failing to load on migration and refactor tasks.
