export {};
type currentState = "idle"|"typing"
declare global {
  interface Window {
    electronAPI: {
      readClipboard: () => string;
      onTypingChange: (
        callback: (isTyping:currentState ) => void
      ) => () => void; 
    };

  }
}