type Numeric = number | bigint
type NonNegative<T extends Numeric> = T extends number 
  ? `${T}` extends `-${string}` ? never : T
  : T

type RevalidateRange<T> = T extends { revalidate: Numeric }
  ? NonNegative<T['revalidate']>
  : never

export type { RevalidateRange, NonNegative, Numeric }
