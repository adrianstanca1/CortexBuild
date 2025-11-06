// Ambient declarations to silence "Could not find a declaration file for module 'react'".
// Remove this file after installing @types/react and @types/react-dom.

declare module 'react' {
  // Minimal any-based exports to satisfy the compiler temporarily.
  const React: any;
  export = React;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export = ReactDOM;
}
