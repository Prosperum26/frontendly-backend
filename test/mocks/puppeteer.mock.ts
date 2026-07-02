module.exports = {
  launch: async () =>
    Promise.resolve({
      newPage: async () =>
        Promise.resolve({
          setViewport: async () => Promise.resolve(),
          setContent: async () => Promise.resolve(),
          screenshot: async () => Promise.resolve(Buffer.from('')),
          close: async () => Promise.resolve(),
          on: () => {},
          addScriptTag: async () => Promise.resolve(),
          addStyleTag: async () => Promise.resolve(),
          evaluate: async () => Promise.resolve(),
        }),
      close: async () => Promise.resolve(),
    }),
};
