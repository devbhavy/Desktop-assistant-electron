import { ipcRenderer, contextBridge} from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

type currentState = "idle"|"typing"
contextBridge.exposeInMainWorld("electronAPI", {
  readClipboard: () =>
    ipcRenderer.invoke("read-clipboard-text"),

  onTypingChange: (
    callback: (isTyping: currentState) => void
  ) => {
    const startedListener = () => callback("typing");
    const stoppedListener = () => callback("idle");

    ipcRenderer.on("typing-started", startedListener);
    ipcRenderer.on("typing-stopped", stoppedListener);

    return () => {
      ipcRenderer.removeListener(
        "typing-started",
        startedListener
      );

      ipcRenderer.removeListener(
        "typing-stopped",
        stoppedListener
      );
    };
  },
});