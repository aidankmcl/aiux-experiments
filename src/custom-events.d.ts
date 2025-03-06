declare global {
  type CommandDetected = { originalCommand: string; timestamp: number };
  type RefineCommand = { action: string; target: string };
  type RequestCategorization = { command: string; targetMappings: { [key: string]: string[] } };
  type CompleteCategorization = { originalCommand: string; category: string; confidence: number; timestamp: number; detectedTargets: string[] };

  interface CustomMapping {
    'speech-detected': CustomEvent<CommandDetected>;
    'refined-command': CustomEvent<RefineCommand>;
    'request-categorization': CustomEvent<RequestCategorization>;
    'complete-categorization': CustomEvent<CompleteCategorization>;
  }

  // For `this.dispatchEvent(new CustomEvent<...>('...', { ... }))`
  interface HTMLElementEventMap extends CustomMapping {}
  // For `window.dispatchEvent(new CustomEvent<...>('...', { ... }))`
  interface GlobalEventHandlersEventMap extends CustomMapping {}
}

// This empty export is necessary to make this a module
export { };