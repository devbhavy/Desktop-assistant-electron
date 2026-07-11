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
      onCatMenuClosed: (
        callback: (
          state: "hover" | "idle"
        ) => void
      ) => () => void;
      setFixedMessage: (message: string) => Promise<any>
      getFixedMessage: () => Promise<any>
      saveReminder: (reminder: {
        message: string
        time: string
        repeat: string
        date: string
        days: string[]
      }) => Promise<boolean>
      
      closeReminderWindow: () => void
      onReminderTriggered: (
        callback: (reminder: {
          id: string
          message: string
          time: string
          repeat: string
          date: string
          days: string[]
        }) => void
      ) => () => void
      
      dismissReminderAlert: () => void
      getPomodoroEndTime: () => Promise<number | null>
      startPomodoro: (
        focusMinutes: number,
        breakMinutes: number
      ) => void
      getPomodoroState: () => Promise<{
        endTime: number | null
        phase: "focus" | "break"
      }>
      completePomodoroPhase: () => Promise<{
        endTime: number
        phase: "focus" | "break"
      } | null>
      startBreakStretch: (
        minutes: number
      ) => void
      getSettings: () => Promise<{
        alwaysOnTop: boolean
        skin: "orange" | "black" | "white"
      }>
      
      setAlwaysOnTop: (
        value: boolean
      ) => void
      
      setCatSkin: (
        skin: "orange" | "black" | "white"
      ) => void
      
      onCatSkinChanged: (
        callback: (
          skin: "orange" | "black" | "white"
        ) => void
      ) => () => void
      closeSettingsWindow: () => void
      closeMessageWindow: () => void
      resetDefault: () => void
      onPomodoroPhaseChanged: (
        callback: (
          phase:
            | "focus"
            | "break"
        ) => void
      ) => () => void
    };
  }
}