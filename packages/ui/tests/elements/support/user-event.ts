// Shared trusted-event user simulator (CDP-backed) for browser-mode component
// tests. Use for all test interactions.
//
// vite-plus 0.2 (vitest 4) exports the `userEvent` singleton from the browser
// context, so we can re-export it directly. (Earlier 0.1.x releases only shipped
// a runtime `createUserEvent()` factory that was missing from the types, which
// required a dynamic-import workaround here.)
export { userEvent } from 'vite-plus/test/browser/context';
