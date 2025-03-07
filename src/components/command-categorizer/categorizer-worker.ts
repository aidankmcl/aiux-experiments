// TypeScript worker implementation for command categorization

// Type definitions for worker messages
export interface WorkerMessageEvent {
  data: WorkerMessage;
}

export interface WorkerMessage {
  type: string;
  data?: any;
}

export interface InitializeMessage extends WorkerMessage {
  type: 'initialize';
  data: {
    modelName: string;
  };
}

export interface CategorizeMessage extends WorkerMessage {
  type: 'categorize';
  data: {
    command: string;
    targetMappings: Record<string, string[]>;
  };
}

export interface CategorizationResultMessage extends WorkerMessage {
  type: 'categorization_result';
  data: {
    originalCommand: string;
    category: string;
    confidence: number;
    detectedTargets: string[];
    timestamp: number;
  };
}

export interface StatusMessage extends WorkerMessage {
  type: 'status';
  data: {
    message: string;
  };
}

export interface ErrorMessage extends WorkerMessage {
  type: 'error';
  data: {
    message: string;
    error: string;
  };
}

export type CategorizerWorkerInMessage = InitializeMessage | CategorizeMessage;
export type CategorizerWorkerOutMessage = CategorizationResultMessage | StatusMessage | ErrorMessage | WorkerMessage;

// The actual worker code
const workerCode = () => {
  const ctx: Worker = self as any;
  
  let classifier: any = null;
  let isInitializing = false;

  // Add error handler
  ctx.addEventListener('error', (error: ErrorEvent) => {
    ctx.postMessage({
      type: 'error',
      data: { message: 'Worker error', error: String(error) }
    });
  });

  // Initialize the classifier
  async function initializeClassifier(modelName: string) {
    if (isInitializing) return;
    
    isInitializing = true;
    try {
      ctx.postMessage({ type: 'status', data: { message: 'Loading transformer library...' } });
      
      // Dynamically import the transformers library
      // Note: This requires the bundler to correctly handle dynamic imports in workers
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure Transformers.js environment
      env.allowLocalModels = false;
      
      ctx.postMessage({ type: 'status', data: { message: 'Loading model: ' + modelName } });
      
      // Load the model
      const pipe = await pipeline('zero-shot-classification', modelName);
      classifier = (text: string, labels: string[]) => pipe(text, labels)
        .then((output: any) => {
          if (Array.isArray(output)) return output[0];
          return output;
        });
        
      ctx.postMessage({ type: 'model_loaded' });
    } catch (error) {
      ctx.postMessage({ 
        type: 'error', 
        data: { message: 'Failed to initialize classifier', error: String(error) } 
      });
    } finally {
      isInitializing = false;
    }
  }

  // Process command categorization
  async function categorizeCommand(command: string, targetMappings: Record<string, string[]>) {
    try {
      if (!classifier) {
        return { category: 'unknown', confidence: 0, detectedTargets: [] };
      }

      const output = await classifier(command, Object.keys(targetMappings));
      const category = output.labels[0];
      const confidence = output.scores[0];

      // Then, if we have landmarks for this category, check for them
      const detectedTargets: string[] = [];
      const mapping = targetMappings[category];

      if (mapping && mapping.length) {
        const targetOutput = await classifier(command, mapping);

        // Only include landmarks with confidence > 0.5
        for (let i = 0; i < targetOutput.labels.length; i++) {
          if (targetOutput.scores[i] > 0.5) {
            detectedTargets.push(targetOutput.labels[i]);
          }
        }
      }

      return { category, confidence, detectedTargets };
    } catch (error) {
      ctx.postMessage({
        type: 'error',
        data: { message: 'Categorization error', error: String(error) }
      });
      return { category: 'unknown', confidence: 0, detectedTargets: [] };
    }
  }

  // Handle messages from the main thread
  ctx.addEventListener('message', async (event: MessageEvent) => {
    try {
      const { type, data } = event.data;
      
      switch (type) {
        case 'initialize':
          await initializeClassifier(data.modelName);
          break;
          
        case 'categorize':
          const result = await categorizeCommand(data.command, data.targetMappings);
          ctx.postMessage({
            type: 'categorization_result',
            data: {
              originalCommand: data.command,
              ...result,
              timestamp: Date.now()
            }
          });
          break;
          
        default:
          console.error('Unknown message type:', type);
      }
    } catch (error) {
      ctx.postMessage({
        type: 'error',
        data: { message: 'Message processing error', error: String(error) }
      });
    }
  });

  // Let the main thread know the worker is ready
  try {
    ctx.postMessage({ type: 'ready' });
  } catch (error) {
    console.error('Failed to send ready message:', error);
  }
};

// Convert the worker function to a string
const workerCodeStr = `(${workerCode.toString()})()`;

// Create a Blob containing the worker code
const blob = new Blob([workerCodeStr], { type: 'application/javascript' });

// Create a URL for the Blob
export const categorizerWorkerURL = URL.createObjectURL(blob);

// Clean up function to revoke the URL when done
export function cleanupCategorizerWorker() {
  URL.revokeObjectURL(categorizerWorkerURL);
}
