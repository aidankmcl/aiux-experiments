// TypeScript worker implementation for speech processing

// Type definitions for worker messages
export interface WorkerMessageEvent {
  data: WorkerMessage;
}

export interface WorkerMessage {
  type: string;
  data?: any;
}

export interface ProcessCommandMessage extends WorkerMessage {
  type: 'process_command';
  data: {
    command: string;
  };
}

export interface CommandProcessedMessage extends WorkerMessage {
  type: 'command_processed';
  data: {
    originalCommand: string;
    timestamp: number;
  };
}

export type SpeechWorkerInMessage = ProcessCommandMessage;
export type SpeechWorkerOutMessage = CommandProcessedMessage | WorkerMessage;

// The actual worker code
const workerCode = () => {
  const ctx: Worker = self as any;
  
  // Add error handler for uncaught errors
  ctx.addEventListener('error', (error: ErrorEvent) => {
    ctx.postMessage({
      type: 'error',
      data: { message: 'Worker error', error: String(error) }
    });
  });

  // Process the speech recognition results
  ctx.addEventListener('message', (event: MessageEvent) => {
    try {
      const { type, data } = event.data;
      
      switch (type) {
        case 'process_command':
          // Here we can do any text processing needed on the command
          ctx.postMessage({
            type: 'command_processed',
            data: {
              originalCommand: data.command,
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
export const speechWorkerURL = URL.createObjectURL(blob);

// Clean up function to revoke the URL when done
export function cleanupSpeechWorker() {
  URL.revokeObjectURL(speechWorkerURL);
}
