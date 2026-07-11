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
  
  startDrag: () => {
    ipcRenderer.send("start-drag");
  },
  
  stopDrag: () => {
    ipcRenderer.send("stop-drag");
  },
  showCatMenu: () => {
    ipcRenderer.send("show-cat-menu");
  },
  onCatMenuClosed: (
    callback: (state: "hover" | "idle") => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      state: "hover" | "idle"
    ) => {
      callback(state);
    };
  
    ipcRenderer.on(
      "cat-menu-closed",
      listener
    );
  
    return () => {
      ipcRenderer.removeListener(
        "cat-menu-closed",
        listener
      );
    };
  },

  setFixedMessage: (message: string) =>
    ipcRenderer.invoke("set-fixed-message", message),

  getFixedMessage: () =>
    ipcRenderer.invoke("get-fixed-message"),
  saveReminder: (reminder: {
    message: string
    time: string
    repeat: string
    date: string
    days: string[]
  }) => ipcRenderer.invoke("save-reminder", reminder),
  
  closeReminderWindow: () =>
    ipcRenderer.send("close-reminder-window"),

  onReminderTriggered: (
    callback: (reminder: {
      id: string
      message: string
      time: string
      repeat: string
      date: string
      days: string[]
    }) => void
  ) => {
    const listener = (_event: unknown, reminder: any) => {
      callback(reminder)
    }
  
    ipcRenderer.on("reminder-triggered", listener)
  
    return () => {
      ipcRenderer.removeListener(
        "reminder-triggered",
        listener
      )
    }
  },
  
  dismissReminderAlert: () =>
    ipcRenderer.send("dismiss-reminder-alert"),
  getPomodoroEndTime: () =>
    ipcRenderer.invoke("get-pomodoro-end-time"),
  startPomodoro: (
    focusMinutes: number,
    breakMinutes: number
  ) => {
    ipcRenderer.send("start-pomodoro", {
      focusMinutes,
      breakMinutes,
    })
  },
  getPomodoroState: () =>
    ipcRenderer.invoke("get-pomodoro-state"),
  completePomodoroPhase: () =>
    ipcRenderer.invoke("complete-pomodoro-phase"),
  startBreakStretch: (minutes: number) => {
    ipcRenderer.send(
      "start-break-stretch",
      minutes
    )
  },
  getSettings: () =>
    ipcRenderer.invoke("get-settings"),
  
  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.send(
      "set-always-on-top",
      value
    ),
  
  setCatSkin: (
    skin: "orange" | "black" | "white"
  ) =>
    ipcRenderer.send(
      "set-cat-skin",
      skin
    ),
  
  onCatSkinChanged: (
    callback: (
      skin: "orange" | "black" | "white"
    ) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      skin: "orange" | "black" | "white"
    ) => {
      callback(skin)
    }
  
    ipcRenderer.on(
      "cat-skin-changed",
      listener
    )
  
    return () => {
      ipcRenderer.removeListener(
        "cat-skin-changed",
        listener
      )
    }
  },
  closeSettingsWindow: () => {
    ipcRenderer.send("close-settings-window")
  },
  closeMessageWindow: () => {
    ipcRenderer.send("close-message-window")
  },
  resetDefault : ()=>{
    ipcRenderer.send("reset-to-default")
  },
  onPomodoroPhaseChanged: (
    callback:any
  ) => {
    const listener = (_event:any, phase:any) => {
      callback(phase)
    }
  
    ipcRenderer.on(
      "pomodoro-phase-changed",
      listener
    )
  
    return () => {
      ipcRenderer.removeListener(
        "pomodoro-phase-changed",
        listener
      )
    }
  },
});

