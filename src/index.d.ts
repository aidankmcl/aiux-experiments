// speech.d.ts
// interface SpeechRecognition extends EventTarget {
//   lang: string;
//   start(): void;
//   stop(): void;
//   onresult: ((event: SpeechRecognitionEvent) => void) | null;
//   // ... add any other properties or methods you need
// }

// interface SpeechRecognitionEvent extends Event {
//   readonly results: SpeechRecognitionResultList;
// }

// interface SpeechRecognitionResultList {
//   readonly length: number;
//   [index: number]: SpeechRecognitionResult;
// }

// interface SpeechRecognitionResult {
//   readonly length: number;
//   readonly isFinal: boolean;
//   [index: number]: SpeechRecognitionAlternative;
// }

// interface SpeechRecognitionAlternative {
//   readonly transcript: string;
//   readonly confidence: number;
// }

// declare var SpeechRecognition: {
//   prototype: SpeechRecognition;
//   new(): SpeechRecognition;
// };

// declare var webkitSpeechRecognition: {
//   prototype: SpeechRecognition;
//   new(): SpeechRecognition;
// };
