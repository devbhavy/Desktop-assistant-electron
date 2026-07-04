export {};

declare global {
  interface Window {
    electronAPI: {
      readClipboard: () => string;
    };
  }
}