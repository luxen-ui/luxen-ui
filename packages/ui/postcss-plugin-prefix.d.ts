declare const plugin: {
  (opts?: { elementPrefix?: string; cssPrefix?: string }): {
    postcssPlugin: string;
    Once: (root: unknown) => void;
  };
  postcss: true;
};

export default plugin;
