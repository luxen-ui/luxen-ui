import { setPrefix } from 'luxen-ui';

export default defineNuxtPlugin(async () => {
  setPrefix({ element: 'ds', css: 'ds' });

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
