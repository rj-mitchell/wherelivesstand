/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'virtual:family' {
  /** The family kit's endorsement line (public/family/endorsement.html). */
  export const endorsement: string;
  /** The family kit's footer shelf (public/family/shelf.html). */
  export const shelf: string;
}
