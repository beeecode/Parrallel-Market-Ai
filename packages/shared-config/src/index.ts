export const workspacePackages = [
  '@parallel-market-ai/web',
  '@parallel-market-ai/cms',
  '@parallel-market-ai/next-prototype',
  '@parallel-market-ai/shared-types',
  '@parallel-market-ai/shared-config',
  '@parallel-market-ai/validation',
] as const

export type WorkspacePackageName = (typeof workspacePackages)[number]
