export {};

type currentState = "idle" | "typing";

declare global {
  interface Window {
    electronAPI: {
      readClipboard: () => Promise<string>;

      lockWindowSize: () => void;

      getWindowPosition: () => Promise<[number, number]>;
      showCatMenu: () => void;

      setWindowPosition: (
        x: number,
        y: number
      ) => void;

      onTypingChange: (
        callback: (isTyping: currentState) => void
      ) => () => void;
      startDrag: () => void;
      stopDrag: () => void;
    };
  }
}