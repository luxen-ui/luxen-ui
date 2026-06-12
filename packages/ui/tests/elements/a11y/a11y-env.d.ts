// Ambient declarations for the a11y browser suite. Test files are in no tsconfig
// `include`, so they reference this file directly (see a11y.browser.test.ts).
//
// Plain CSS imported for its side effect (injects styles into the test iframe);
// it has no JS bindings, so the default Vite `*.css` → string typing does not
// apply to a bare `import './x.css'`.
declare module '*.css';
