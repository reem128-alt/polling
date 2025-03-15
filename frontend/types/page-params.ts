type SegmentParams<T extends object = unknown> = T extends Record<string, unknown>
  ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
  : T

export type { SegmentParams }
