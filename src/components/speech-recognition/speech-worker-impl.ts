// Speech recognition worker implementation

// Speech recognition instance
let recognition: any = null;
let listening = false;

// Initialize speech recognition
function initializeSpeechRecognition() {
  try {
    // Access SpeechRecognition from the global scope
    const SpeechRecognition = (self as any).SpeechRecognition || (self as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      postMessage({
        type: 'error',
        data: {
          message: 'Speech Recognition not supported',
          error: 'SpeechRecognition API not available in this browser'
        }
      });
      return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Setup event listeners
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const isFinal = event.results[event.results.length - 1].isFinal;
      
      postMessage({
        type: 'transcript',
        data: {
          transcript: transcript,
          isFinal: isFinal,
          timestamp: Date.now()
        }
      });
    };

    recognition.onerror = (event: any) => {
      postMessage({
        type: 'error',
        data: {
          message: 'Speech recognition error',
          error: event.error
        }
      });
      listening = false;
      postMessage({
        type: 'listening_state',
        data: { listening: false }
      });
    };

    recognition.onend = () => {
      listening = false;
      postMessage({
        type: 'listening_state',
        data: { listening: false }
      });
    };
    
    return true;
  } catch (error: any) {
    postMessage({
      type: 'error',
      data: {
        message: 'Failed to initialize speech recognition',
        error: error.message || 'Unknown error'
      }
    });
    return false;
  }
}

// Start listening for speech
function startRecognition(lang?: string) {
  try {
    if (!recognition) {
      if (!initializeSpeechRecognition()) {
        return;
      }
    }
    
    if (lang) {
      recognition.lang = lang;
    }
    
    recognition.start();
    listening = true;
    postMessage({
      type: 'listening_state',
      data: { listening: true }
    });
  } catch (error: any) {
    postMessage({
      type: 'error',
      data: {
        message: 'Failed to start recognition',
        error: error.message || 'Unknown error'
      }
    });
  }
}

// Stop listening
function stopRecognition() {
  try {
    if (recognition && listening) {
      recognition.stop();
      listening = false;
      postMessage({
        type: 'listening_state',
        data: { listening: false }
      });
    }
  } catch (error: any) {
    postMessage({
      type: 'error',
      data: {
        message: 'Failed to stop recognition',
        error: error.message || 'Unknown error'
      }
    });
  }
}

// Handle messages from the main thread
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'start_recognition':
      startRecognition(data?.lang);
      break;
      
    case 'stop_recognition':
      stopRecognition();
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
};

// Signal that the worker is ready
postMessage({ type: 'ready' });
