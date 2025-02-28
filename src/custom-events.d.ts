declare global {
  interface HTMLElementEventMap {
    'refined-command': CustomEvent<{ action: string; target: string }>;
  }
}

// This empty export is necessary to make this a module
export { };