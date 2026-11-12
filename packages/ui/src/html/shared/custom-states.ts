/**
 * Adds or removes a custom state, the one CSS reads with `:state(name)`. Does
 * nothing where `ElementInternals.states` is missing (browsers before 2024):
 * the element still works, only the state selector never matches.
 */
export function toggleState(internals: ElementInternals, name: string, on: boolean): void {
  const states = internals.states as CustomStateSet | undefined;
  if (!states) return;
  if (on) states.add(name);
  else states.delete(name);
}
