// TypeScript worker implementation for speech processing

// Input message types from main thread to worker
export interface StartRecognitionMessage {
  type: 'start_recognition';
  data?: { lang?: string };
}

export interface StopRecognitionMessage {
  type: 'stop_recognition';
}

export type SpeechWorkerInMessage = 
  | StartRecognitionMessage
  | StopRecognitionMessage;

// Output message types from worker to main thread
export interface ReadyMessage {
  type: 'ready';
  data: undefined
}

export interface TranscriptMessage {
  type: 'transcript';
  data: {
    transcript: string;
    isFinal: boolean;
    timestamp: number;
  };
}

export interface ErrorMessage {
  type: 'error';
  data: {
    message: string;
    error: any;
  };
}

export interface ListeningStateMessage {
  type: 'listening_state';
  data: {
    listening: boolean;
  };
}

export type SpeechWorkerOutMessage = 
  | ReadyMessage
  | TranscriptMessage
  | ErrorMessage
  | ListeningStateMessage;

// Create worker instance using the separate implementation file
let _speechWorker: Worker | null = null;

// Get or create the speech worker instance
export function getSpeechWorker(): Worker {
  if (!_speechWorker) {
    _speechWorker = new Worker(new URL('./speech-worker-impl.ts', import.meta.url));
  }
  return _speechWorker;
}

// Clean up the worker when done
export function cleanupSpeechWorker(): void {
  if (_speechWorker) {
    _speechWorker.terminate();
    _speechWorker = null;
  }
}
