// This file contains type declarations for Next.js generated types
// It helps suppress TypeScript errors in the .next directory

// Allow the Function type to be used in Next.js generated files
// @ts-ignore
type NextFunction = Function;

// Declare module for Next.js generated type files
declare module '.next/types/**/*.ts' {
  // Suppress specific TypeScript errors for these files
  // @ts-ignore
  export const config: any;
  // @ts-ignore
  export default NextFunction;
  // @ts-ignore
  export const generateStaticParams: NextFunction;
  // @ts-ignore
  export const revalidate: any;
  // @ts-ignore
  export const dynamic: any;
}
