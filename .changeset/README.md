# Changesets

Each PR with a user-facing change must include a changeset describing what changed and at which severity. Run:

```bash
vp run changeset
```

The CLI will prompt for: which packages changed → patch/minor/major → a one-paragraph summary. It writes a `.changeset/<random-name>.md` file. Commit it with your code.

## Bump types in 0.x

While we're in `0.x`, semver says anything can change. Map it to changesets bumps like this:

| Change                                                 | Bump                    |
| ------------------------------------------------------ | ----------------------- |
| Bug fix                                                | `patch` (0.1.0 → 0.1.1) |
| New API or component                                   | `minor` (0.1.0 → 0.2.0) |
| **Breaking change** (rename, removal, behavior change) | `minor` (0.1.0 → 0.2.0) |
| Intentional bump to 1.0                                | `major` (0.x → 1.0.0)   |

⚠️ In `0.x`, never use `major` for a breaking change — it would jump straight to `1.0.0`. Use `minor` instead.

## Writing the prose

The body of the changeset becomes a public CHANGELOG entry. Write for the user installing `luxen-ui`, not for someone reading the diff.

✅ "Added `data-loading` attribute on `<l-button>` for showing a spinner during async actions."

❌ "Refactored Button.ts to extract LoadingState into a separate class."

## No user-facing change?

For docs, CI, internal refactors, etc., create an empty changeset:

```bash
vp run changeset --empty
```

This keeps the CI check green without polluting the CHANGELOG.

## Full release process

See `Release Process` section in `CLAUDE.md` at the repo root.
