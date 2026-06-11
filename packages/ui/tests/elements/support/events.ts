/**
 * Resolve with the event when `eventName` fires on `target`; reject after
 * `timeout` ms so a missed event fails the test loudly (never silently passes).
 */
export function waitForEvent(
  target: EventTarget,
  eventName: string,
  timeout = 1000,
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for "${eventName}" event`)),
      timeout,
    );
    target.addEventListener(
      eventName,
      (e) => {
        clearTimeout(timer);
        resolve(e);
      },
      { once: true },
    );
  });
}
