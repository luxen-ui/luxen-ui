import type { UserEvent } from 'vite-plus/test/browser/context';

// Shared singleton for browser-mode component tests.
//
// WORKAROUND (vite-plus 0.1.22): a static `import { userEvent }` from
// 'vite-plus/test/browser/context' type-checks but throws at runtime — the
// virtual module declares `userEvent` in its types but does not export it.
// `createUserEvent()` is the real runtime export (missing from the .d.ts).
// Delete this indirection and switch to a direct import once vite-plus ships
// the singleton.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (await import('vite-plus/test/browser/context')) as any;

/** Trusted-event user simulator (CDP-backed). Use for all test interactions. */
export const userEvent: UserEvent = ctx.createUserEvent();
