export {};

declare global {
  interface Window {
    electronAPI: {
      readClipboard: () => string;
      onTypingChange: (
        callback: (isTyping: boolean) => void
      ) => () => void; 
    };

  }
}