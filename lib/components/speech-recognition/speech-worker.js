// TypeScript worker implementation for speech processing
// Create worker instance using the separate implementation file
let _speechWorker = null;
// Get or create the speech worker instance
function getSpeechWorker() {
    if (!_speechWorker) {
        _speechWorker = new Worker(new URL('./speech-worker-impl.ts', import.meta.url));
    }
    return _speechWorker;
}
// Clean up the worker when done
function cleanupSpeechWorker() {
    if (_speechWorker) {
        _speechWorker.terminate();
        _speechWorker = null;
    }
}

export { cleanupSpeechWorker, getSpeechWorker };
//# sourceMappingURL=speech-worker.js.map
