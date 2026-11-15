// No `setPrefix()` call: `luxen()` in nuxt.config.ts bakes the `ds` prefix into
// the registry, in dev and build alike.
export default defineNuxtPlugin(async () => {
  await Promise.all([
    import('luxen-ui/badge'),
    import('luxen-ui/dialog'),
    import('luxen-ui/divider'),
    import('luxen-ui/dropdown'),
    import('luxen-ui/dropdown-item'),
    import('luxen-ui/icon'),
    import('luxen-ui/popover'),
  ]);
});
