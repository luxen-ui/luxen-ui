/**
 * Poll `predicate` every 10 ms until it returns `true`, or until `timeout`
 * elapses — then resolve anyway so the caller asserts the real condition and
 * gets a meaningful failure.
 *
 * Use this for CI-load-tolerant waits where a fixed delay flakes: a lazily
 * `import()`ed module appearing, or an attribute removed after an async teardown
 * (reading `getComputedStyle` before the attribute clears is a false positive in
 * CI). Prefer `waitForEvent` when a specific event marks completion.
 */
export function waitUntil(predicate: () => boolean, timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      if (predicate() || Date.now() >= deadline) resolve();
      else setTimeout(check, 10);
    };
    check();
  });
}
