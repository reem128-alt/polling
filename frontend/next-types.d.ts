// This file contains type declarations for Next.js generated types
// It helps suppress TypeScript errors in the .next directory

// Allow the Function type to be used in Next.js generated files

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type NextFunction = Function;

// Declare module for Next.js generated type files
declare module '.next/types/**/*.ts' {
  // Suppress specific TypeScript errors for these files
 
  export const config: unknown;

  export default NextFunction;
  
  export const generateStaticParams: NextFunction;
 
  export const revalidate: unknown;
  
  export const dynamic: never;
}
