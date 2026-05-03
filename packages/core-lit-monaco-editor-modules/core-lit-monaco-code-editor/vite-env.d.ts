/// <reference types="vite/client" />

declare module "*?worker" {
  const workerFactory: {
    new (): Worker;
  };
  export default workerFactory;
}

declare module "*.css?inline" {
  const css: string;
  export default css;
}
