export interface StartRecognitionMessage {
    type: 'start_recognition';
    data?: {
        lang?: string;
    };
}
export interface StopRecognitionMessage {
    type: 'stop_recognition';
}
export type SpeechWorkerInMessage = StartRecognitionMessage | StopRecognitionMessage;
export interface ReadyMessage {
    type: 'ready';
    data: undefined;
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
export type SpeechWorkerOutMessage = ReadyMessage | TranscriptMessage | ErrorMessage | ListeningStateMessage;
export declare function getSpeechWorker(): Worker;
export declare function cleanupSpeechWorker(): void;
