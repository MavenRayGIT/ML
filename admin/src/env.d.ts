/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_ML_ENV: "staging" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
