/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Deployed P0 prototype. Falls back to the local dev server — see src/lib/links.ts. */
  readonly VITE_PROTOTYPE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
