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
export declare const speechWorkerURL: string;
export declare function cleanupSpeechWorker(): void;
