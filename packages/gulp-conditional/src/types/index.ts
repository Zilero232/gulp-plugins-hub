// Plugin options configuration
export interface GulpConditionalOptions<T> {
  // Array of conditional handlers to process
  handlers: ConditionalHandler<T>[];
  // Optional default handler if no conditions match
  defaultHandler?: T;
}

// Handler configuration for conditional processing
export interface ConditionalHandler<T> {
  // Condition that determines if handler should be executed
  condition: boolean | (() => boolean);
  // Stream transformation function
  handler: T;
}

