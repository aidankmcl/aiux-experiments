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
export declare const categorizerWorkerURL: string;
export declare function cleanupCategorizerWorker(): void;
