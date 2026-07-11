import { app, BrowserWindow, clipboard, ipcMain,screen,Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {uIOhook} from 'uiohook-napi'
import { WebContents } from 'electron'


const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import fs from "node:fs"

let DATA_PATH = ""


process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let messageWin: BrowserWindow | null = null;
let reminderWin: BrowserWindow | null = null;
let reminderAlertWin: BrowserWindow | null = null
let pomodoroSetupWin: BrowserWindow | null = null

const POMODORO_SETUP_WIDTH = 300
const POMODORO_SETUP_HEIGHT = 220
const POMODORO_SETUP_OFFSET_Y = -280
const POMODORO_SETUP_OFFSET_X = -280

const MESSAGE_WIDTH = 320
const MESSAGE_HEIGHT = 180

const MESSAGE_OFFSET_X = -30
const MESSAGE_OFFSET_Y = -180


const REMINDER_OFFSET_X = -45;
const REMINDER_OFFSET_Y = -250;
const REMINDER_WIDTH = 470;
const REMINDER_HEIGHT = 230;
const ALERT_WIDTH = 320
const ALERT_HEIGHT = 110

const ALERT_OFFSET_X = -80
const ALERT_OFFSET_Y = -120

ipcMain.handle('read-clipboard-text', () => {
  return clipboard.readText()
})


type AppData = {
  fixedMessage: string

  settings: {
    alwaysOnTop: boolean
    skin: CatSkin
  }

  reminders: ReminderData[]

  breakStretch: {
    active: boolean
    minutes: number
  } | null
}

const defaultData: AppData = {
  fixedMessage: "",

  settings: {
    alwaysOnTop: true,
    skin: "orange",
  },

  reminders: [],

  breakStretch: null,
}

function saveData() {
  const data: AppData = {
    fixedMessage,

    settings: {
      alwaysOnTop,
      skin: currentSkin,
    },

    reminders,

    breakStretch:
      breakStretchMinutes !== null
        ? {
            active: true,
            minutes: breakStretchMinutes,
          }
        : null,
  }

  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify(data, null, 2),
    "utf8"
  )
}


function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(
        DATA_PATH,
        JSON.stringify(defaultData, null, 2),
        "utf8"
    )

    return
}

  const raw = fs.readFileSync(
    DATA_PATH,
    "utf8"
  )

  const data: AppData =
    JSON.parse(raw)

  fixedMessage = data.fixedMessage

  currentSkin =
    data.settings.skin

  alwaysOnTop =
    data.settings.alwaysOnTop

  reminders.push(...data.reminders)
  for (const reminder of reminders) {
    scheduleReminder(reminder)
  }


  if (data.breakStretch) {
    startBreakStretch(data.breakStretch.minutes)
  }
}

let dragTimer: NodeJS.Timeout | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let fixedWidth = 0;
let fixedHeight = 0;

let pomodoroWin: BrowserWindow | null = null

const POMODORO_WIDTH = 160
const POMODORO_HEIGHT = 70
const POMODORO_OFFSET_Y = -80
const POMODORO_OFFSET_X = -80

let breakStretchInterval: NodeJS.Timeout | null = null
let breakStretchMinutes: number | null = null
let breakStretchSetupWin: BrowserWindow | null = null

const BREAK_STRETCH_WIDTH = 300
const BREAK_STRETCH_HEIGHT = 170
const BREAK_STRETCH_OFFSET_Y = -80
const BREAK_STRETCH_OFFSET_X = -380


let settingsWin: BrowserWindow | null = null

const SETTINGS_WIDTH = 360
const SETTINGS_HEIGHT = 280
const SETTINGS_OFFSET_Y = -80
const SETTINGS_OFFSET_X = -380

type CatSkin = "orange" | "black" | "white"

let currentSkin: CatSkin = "black"
let alwaysOnTop = true

ipcMain.on("start-drag", (event) => {
  const targetWindow =
    BrowserWindow.fromWebContents(event.sender);

  if (!targetWindow) return;

  const cursor = screen.getCursorScreenPoint();
  const bounds = targetWindow.getBounds();

  dragOffsetX = cursor.x - bounds.x;
  dragOffsetY = cursor.y - bounds.y;

  fixedWidth = bounds.width;
  fixedHeight = bounds.height;

  if (dragTimer) {
    clearInterval(dragTimer);
  }

  dragTimer = setInterval(() => {
    if (targetWindow.isDestroyed()) return;

    const currentCursor =
      screen.getCursorScreenPoint();

    const catX =
      currentCursor.x - dragOffsetX;

    const catY =
      currentCursor.y - dragOffsetY;

    // Keep cat size fixed
    targetWindow.setBounds({
      x: catX,
      y: catY,
      width: fixedWidth,
      height: fixedHeight,
    });

    // Keep message position AND size fixed
    if (
      messageWin &&
      !messageWin.isDestroyed()
    ) {
      messageWin.setBounds({
        x: catX + MESSAGE_OFFSET_X,
        y: catY + MESSAGE_OFFSET_Y,
        width: MESSAGE_WIDTH,
        height: MESSAGE_HEIGHT,
      });
    }


    if (
      reminderWin &&
      !reminderWin.isDestroyed()
    ) {
      reminderWin.setBounds({
        x: catX + REMINDER_OFFSET_X,
        y: catY + REMINDER_OFFSET_Y,
        width: REMINDER_WIDTH,
        height: REMINDER_HEIGHT,
      });
    }


    if (
      reminderAlertWin &&
      !reminderAlertWin.isDestroyed()
    ) {
      reminderAlertWin.setBounds({
        x: catX + ALERT_OFFSET_X,
        y: catY + ALERT_OFFSET_Y,
        width: ALERT_WIDTH,
        height: ALERT_HEIGHT,
      });
    }

    if (
      pomodoroWin &&
      !pomodoroWin.isDestroyed()
    ) {
      pomodoroWin.setBounds({
        x: catX + POMODORO_OFFSET_X,
        y: catY + POMODORO_OFFSET_Y,
        width: POMODORO_WIDTH,
        height: POMODORO_HEIGHT,
      });
    }

    if (
      pomodoroSetupWin &&
      !pomodoroSetupWin.isDestroyed()
    ) {
      pomodoroSetupWin.setBounds({
        x: catX + POMODORO_SETUP_OFFSET_X,
        y: catY + POMODORO_SETUP_OFFSET_Y,
        width: POMODORO_SETUP_WIDTH,
        height: POMODORO_SETUP_HEIGHT,
      });
    }
    if (
      settingsWin &&
      !settingsWin.isDestroyed()
    ) {
      settingsWin.setBounds({
        x: catX + SETTINGS_OFFSET_X,
        y: catY + SETTINGS_OFFSET_Y,
        width: SETTINGS_WIDTH,
        height: SETTINGS_HEIGHT,
      });
    }

    if (
      breakStretchSetupWin &&
      !breakStretchSetupWin.isDestroyed()
    ) {
      breakStretchSetupWin.setBounds({
        x: catX + BREAK_STRETCH_OFFSET_X,
        y: catY + BREAK_STRETCH_OFFSET_Y,
        width: BREAK_STRETCH_WIDTH,
        height: BREAK_STRETCH_HEIGHT,
      });
    }

    
  }, 16);
});

ipcMain.on("stop-drag", () => {
  if (dragTimer) {
    clearInterval(dragTimer);
    dragTimer = null;
  }
});


ipcMain.on(
  "start-pomodoro",
  (_event, config: PomodoroConfig) => {
    pomodoroConfig = config
    pomodoroPhase = "focus"

    pomodoroEndTime =
      Date.now() +
      config.focusMinutes * 60 * 1000

    pomodoroSetupWin?.close()
    createPomodoroWindow()
  }
)
let fixedMessage = "";
ipcMain.on("close-message-window", () => {
  if (messageWin && !messageWin.isDestroyed()) {
    messageWin.close()
  }
})

type ReminderData = {
  id: string
  message: string
  time: string
  repeat: string
  date: string
  days: string[]
}
const reminders: ReminderData[] = []

function scheduleOnceReminder(reminder: ReminderData) {
  const reminderDate = new Date(
    `${reminder.date}T${reminder.time}:00`
  )

  const delay =
    reminderDate.getTime() - Date.now()

  if (delay <= 0) {
    console.log("Reminder time is already in the past")
    return
  }

  const timer = setTimeout(() => {
    console.log("REMINDER:", reminder.message)
    showReminderAlert(reminder)

    reminderTimers.delete(reminder.id)
  }, delay)

  reminderTimers.set(reminder.id, timer)

  console.log(
    `Scheduled "${reminder.message}" for`,
    reminderDate
  )
}

function scheduleDailyReminder(reminder: ReminderData) {
  const [hours, minutes] = reminder.time
    .split(":")
    .map(Number)

  const now = new Date()

  const nextReminder = new Date()
  nextReminder.setHours(hours, minutes, 0, 0)

  // Today's time already passed → schedule tomorrow
  if (nextReminder.getTime() <= now.getTime()) {
    nextReminder.setDate(nextReminder.getDate() + 1)
  }

  const delay = nextReminder.getTime() - now.getTime()

  const timer = setTimeout(() => {
    console.log("DAILY REMINDER:", reminder.message)

    showReminderAlert(reminder)

    // Schedule the next occurrence
    scheduleDailyReminder(reminder)
  }, delay)

  reminderTimers.set(reminder.id, timer)

  console.log(
    `Scheduled daily "${reminder.message}" for`,
    nextReminder
  )
}
function scheduleWeeklyReminder(reminder: ReminderData) {
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  const selectedDays = reminder.days
    .map((day) => dayMap[day])
    .filter((day) => day !== undefined)

  if (selectedDays.length === 0) {
    console.log("No valid days selected")
    return
  }

  const [hours, minutes] = reminder.time
    .split(":")
    .map(Number)

  const now = new Date()

  let nextReminder: Date | null = null

  // Check today + next 7 days
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now)

    candidate.setDate(now.getDate() + offset)
    candidate.setHours(hours, minutes, 0, 0)

    const isSelectedDay =
      selectedDays.includes(candidate.getDay())

    const isFuture =
      candidate.getTime() > now.getTime()

    if (isSelectedDay && isFuture) {
      nextReminder = candidate
      break
    }
  }

  if (!nextReminder) {
    console.log("Could not find next weekly occurrence")
    return
  }

  const delay =
    nextReminder.getTime() - now.getTime()

  const timer = setTimeout(() => {
    console.log(
      "WEEKLY REMINDER:",
      reminder.message
    )

    showReminderAlert(reminder)


    scheduleWeeklyReminder(reminder)
  }, delay)

  reminderTimers.set(reminder.id, timer)

  console.log(
    `Scheduled weekly "${reminder.message}" for`,
    nextReminder.toLocaleString()
  )
}

function scheduleReminder(reminder: ReminderData) {
  switch (reminder.repeat) {
    case "once":
      scheduleOnceReminder(reminder)
      break

    case "daily":
      scheduleDailyReminder(reminder)
      break

    case "weekly":
      scheduleWeeklyReminder(reminder)
      break

    default:
      console.log(
        "Unsupported repeat type:",
        reminder.repeat
      )
  }
}

ipcMain.handle(
  "save-reminder",
  (_, reminder: Omit<ReminderData, "id">) => {
    const savedReminder: ReminderData = {
      ...reminder,
      id: crypto.randomUUID(),
    }

    reminders.push(savedReminder)
    saveData()

    scheduleReminder(savedReminder)

    console.log("Saved reminder:", savedReminder)

    return true
  }
)

ipcMain.on("close-reminder-window", () => {
  if (
    reminderWin &&
    !reminderWin.isDestroyed()
  ) {
    reminderWin.close()
  }
})

ipcMain.on("reset-to-default", () => {
  fixedMessage = defaultData.fixedMessage

  currentSkin = defaultData.settings.skin
  alwaysOnTop = defaultData.settings.alwaysOnTop

  reminders.splice(0, reminders.length)

  for (const timer of reminderTimers.values()) {
    clearTimeout(timer)
  }
  reminderTimers.clear()

  if (breakStretchInterval) {
    clearInterval(breakStretchInterval)
    breakStretchInterval = null
  }

  breakStretchMinutes = null

  win?.setAlwaysOnTop(alwaysOnTop)
  win?.webContents.send(
    "cat-skin-changed",
    currentSkin
  )

  messageWin?.close()

  saveData()
})



const reminderTimers = new Map<string, NodeJS.Timeout>()

ipcMain.on("show-cat-menu", (event) => {
  const targetWindow =
    BrowserWindow.fromWebContents(event.sender);

  if (!targetWindow) return;

  const fixedMessageItems = fixedMessage
    ? [

        {
          label: "Remove fixed message",
          click: () => {
            fixedMessage = "";

            if (
              messageWin &&
              !messageWin.isDestroyed()
            ) {
              messageWin.close();
              saveData();
            }
          },
        },
      ]
    : [
        {
          label: "Fixed message",
          click: () => {
            createMessageWindow();
          },
        },
      ];


      const pomodoroItems = (
        pomodoroEndTime !== null &&
        pomodoroEndTime > Date.now()
      )
        ? [
            {
              label: "Remove Pomodoro",
              click: () => {
                pomodoroEndTime = null
                pomodoroConfig = null
                pomodoroPhase = "focus"
      
                if (
                  pomodoroWin &&
                  !pomodoroWin.isDestroyed()
                ) {
                  pomodoroWin.close()
                }
              },
            },
          ]
        : [
            {
              label: "Start Pomodoro",
              click: () => {
                createPomodoroSetupWindow()
              },
            },
          ]
          const breakStretchItems =
          breakStretchInterval
            ? [
                {
                  label: "Remove Break Stretch",
                  click: () => {
                    if (breakStretchInterval) {
                      clearInterval(
                        breakStretchInterval
                      )
                    }
        
                    breakStretchInterval = null
                    breakStretchMinutes = null
                    saveData()
                  },
                },
              ]
            : [
                {
                  label: "Start Break Stretch",
                  click: () => {
                    createBreakStretchSetupWindow()
                  },
                },
              ]

  const menu = Menu.buildFromTemplate([
    ...fixedMessageItems,

    {
      label: "Reminders",
      click: () => {
        createReminderWindow()
      },
    },
    ...pomodoroItems,
    ...breakStretchItems,
    {
      type: "separator",
    },
    {
      label: "Settings",
      click: () => {
        createSettingsWindow()
      },
    }
  ]);

  menu.popup({
    window: targetWindow,

    callback: () => {
      const cursor =
        screen.getCursorScreenPoint();

      const bounds =
        targetWindow.getBounds();

      const localX =
        cursor.x - bounds.x;

      const localY =
        cursor.y - bounds.y;

      const isInsideHitbox =
        localX >= 29 &&
        localX <= 29 + 105 &&
        localY >= 24 &&
        localY <= 24 + 120;

      targetWindow.webContents.send(
        "cat-menu-closed",
        isInsideHitbox ? "hover" : "idle"
      );
    },
  });
});


ipcMain.handle("get-settings", () => {
  return {
    alwaysOnTop,
    skin: currentSkin,
  }
})
ipcMain.on(
  "set-always-on-top",
  (_event, value: boolean) => {
    alwaysOnTop = value
    saveData();

    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(value)
    }
  }
)

ipcMain.on(
  "set-cat-skin",
  (_event, skin: CatSkin) => {
    currentSkin = skin
    saveData()

    win?.webContents.send(
      "cat-skin-changed",
      skin
    )
  }
)


ipcMain.handle("set-fixed-message", (_, message: string) => {

  fixedMessage = message;
  saveData()
  console.log("Stored fixed message:", fixedMessage);

  return true;
});

ipcMain.handle("get-fixed-message", () => {
  return fixedMessage;
});
ipcMain.on("dismiss-reminder-alert", () => {
  if (
    reminderAlertWin &&
    !reminderAlertWin.isDestroyed()
  ) {
    reminderAlertWin.close()
  }
})

ipcMain.handle("get-pomodoro-state", () => {
  return {
    endTime: pomodoroEndTime,
    phase: pomodoroPhase,
  }
})


ipcMain.handle("complete-pomodoro-phase", () => {
  if (!pomodoroConfig) return null

  if (pomodoroPhase === "focus") {
    pomodoroPhase = "break"

    pomodoroEndTime =
      Date.now() +
      pomodoroConfig.breakMinutes * 60 * 1000
  } else {
    pomodoroPhase = "focus"

    pomodoroEndTime =
      Date.now() +
      pomodoroConfig.focusMinutes * 60 * 1000
  }

  return {
    endTime: pomodoroEndTime,
    phase: pomodoroPhase,
  }
})

ipcMain.on("close-settings-window", () => {
  if (
    settingsWin &&
    !settingsWin.isDestroyed()
  ) {
    settingsWin.close()
  }
})

function startBreakStretch(minutes: number) {
  if (breakStretchInterval) {
    clearInterval(breakStretchInterval)
  }

  breakStretchMinutes = minutes

  saveData()

  breakStretchInterval = setInterval(() => {
    showReminderAlert({
      id: crypto.randomUUID(),
      message: "Time to stretch!",
      time: "",
      repeat: "break-stretch",
      date: "",
      days: [],
    })
  }, minutes * 60 * 1000)
}

ipcMain.on(
  "start-break-stretch",
  (_event, minutes: number) => {
    startBreakStretch(minutes)

    breakStretchSetupWin?.close()
  }
)

function createWindow() {


  
  win = new BrowserWindow({
    width: 160,
    height: 160,
  
    icon: path.join(
      process.env.VITE_PUBLIC,
      "electron-vite.svg"
    ),
  
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop : true,
  
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },

  });

  startHitboxTracking(win);
  let hitboxTimer: NodeJS.Timeout | null = null;

  function startHitboxTracking(targetWindow: BrowserWindow) {
    hitboxTimer = setInterval(() => {
      if (targetWindow.isDestroyed()) return;

  
      if (dragTimer) return;

      const cursor = screen.getCursorScreenPoint();
      const bounds = targetWindow.getBounds();

     
      const localX = cursor.x - bounds.x;
      const localY = cursor.y - bounds.y;

      const isInsideHitbox =
        localX >= 29 &&
        localX <= 29 + 105 &&
        localY >= 24 &&
        localY <= 24 + 120;

      targetWindow.setIgnoreMouseEvents(
        !isInsideHitbox,
        { forward: true }
      );
    }, 16);
  }



  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on("closed",function(){
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    });
  
    win = null;
    messageWin = null;
  })


}
function createMessageWindow() {
  if (!win) return;

  if (
    messageWin &&
    !messageWin.isDestroyed()
  ) {
    messageWin.focus();
    return;
  }

  const catBounds = win.getBounds();

  messageWin = new BrowserWindow({
    width: MESSAGE_WIDTH,
    height: MESSAGE_HEIGHT,

    x: catBounds.x + MESSAGE_OFFSET_X,
    y: catBounds.y + MESSAGE_OFFSET_Y,

    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.mjs"
      ),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    messageWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/fixed-message`
    );
  } else {
    messageWin.loadFile(
      path.join(
        RENDERER_DIST,
        "index.html"
      ),
      {
        hash: "/fixed-message",
      }
    );
  }

  messageWin.on("closed", () => {
    messageWin = null;
  });
}


function createReminderWindow() {
  if(!win){
    return
  }
  if (reminderWin && !reminderWin.isDestroyed()) {
    reminderWin.focus()
    return
  }


  const catBounds = win.getBounds();


  reminderWin = new BrowserWindow({
    width: REMINDER_WIDTH,
    height: REMINDER_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    x: catBounds.x + REMINDER_OFFSET_X,
    y: catBounds.y + REMINDER_OFFSET_Y,


    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    reminderWin.loadURL(`${VITE_DEV_SERVER_URL}#/reminder`)
  } else {
    reminderWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      { hash: "reminder" }
    )
  }

  reminderWin.on("closed", () => {
    reminderWin = null
  })
}

const reminderAlertQueue: ReminderData[] = []
function showReminderAlert(reminder: ReminderData) {
  if (!win || win.isDestroyed()) return

  if (
    reminderAlertWin &&
    !reminderAlertWin.isDestroyed()
  ) {
    reminderAlertQueue.push(reminder)
    return
  }

  const catBounds = win.getBounds()

  reminderAlertWin = new BrowserWindow({
    width: ALERT_WIDTH,
    height: ALERT_HEIGHT,

    x: catBounds.x + ALERT_OFFSET_X,
    y: catBounds.y + ALERT_OFFSET_Y,

    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    reminderAlertWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/reminder-alert`
    )
  } else {
    reminderAlertWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      {
        hash: "/reminder-alert",
      }
    )
  }

  reminderAlertWin.webContents.on(
    "did-finish-load",
    () => {
      reminderAlertWin?.webContents.send(
        "reminder-triggered",
        reminder
      )
    }
  )

  reminderAlertWin.on("closed", () => {
    reminderAlertWin = null
  
    const nextReminder = reminderAlertQueue.shift()
  
    if (nextReminder) {
      showReminderAlert(nextReminder)
    }
  })
}



function createPomodoroWindow() {
  if (!win) return

  if (pomodoroWin && !pomodoroWin.isDestroyed()) {
    pomodoroWin.show()
    return
  }

  const catBounds = win.getBounds()

  pomodoroWin = new BrowserWindow({
    width: POMODORO_WIDTH,
    height: POMODORO_HEIGHT,

    x:
      catBounds.x +
      POMODORO_OFFSET_X,

    y: catBounds.y + POMODORO_OFFSET_Y,

    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    pomodoroWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/pomodoro`
    )
  } else {
    pomodoroWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      {
        hash: "pomodoro",
      }
    )
  }

  pomodoroWin.on("closed", () => {
    pomodoroWin = null
  })
}


type PomodoroPhase = "focus" | "break"

type PomodoroConfig = {
  focusMinutes: number
  breakMinutes: number
}

let pomodoroConfig: PomodoroConfig | null = null
let pomodoroEndTime: number | null = null
let pomodoroPhase: PomodoroPhase = "focus"

function createPomodoroSetupWindow() {
  if (!win) return

  const catBounds = win.getBounds()
  if (pomodoroSetupWin && !pomodoroSetupWin.isDestroyed()) {
    pomodoroSetupWin.focus()
    return
  }

  pomodoroSetupWin = new BrowserWindow({
    width: POMODORO_SETUP_WIDTH,
    height: POMODORO_SETUP_HEIGHT,
    x:
      catBounds.x +
      POMODORO_SETUP_OFFSET_X,

    y: catBounds.y + POMODORO_SETUP_OFFSET_Y,
    
    frame: false,
    resizable: false,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    pomodoroSetupWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/pomodoro-setup`
    )
  } else {
    pomodoroSetupWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      {
        hash: "pomodoro-setup",
      }
    )
  }

  pomodoroSetupWin.on("closed", () => {
    pomodoroSetupWin = null
  })
}



function createBreakStretchSetupWindow() {
  if (!win) return

  const catBounds = win.getBounds()
  if (
    breakStretchSetupWin &&
    !breakStretchSetupWin.isDestroyed()
  ) {
    breakStretchSetupWin.focus()
    return
  }

  breakStretchSetupWin = new BrowserWindow({
    width: BREAK_STRETCH_WIDTH,
    height: BREAK_STRETCH_HEIGHT,
    x : catBounds.x + BREAK_STRETCH_OFFSET_X,
    y : catBounds.y + BREAK_STRETCH_OFFSET_Y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    breakStretchSetupWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/break-stretch-setup`
    )
  } else {
    breakStretchSetupWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      {
        hash: "break-stretch-setup",
      }
    )
  }

  breakStretchSetupWin.on("closed", () => {
    breakStretchSetupWin = null
  })
}



function createSettingsWindow() {
  if (!win) return

  const catBounds = win.getBounds()

  if (
    settingsWin &&
    !settingsWin.isDestroyed()
  ) {
    settingsWin.focus()
    return
  }
  

  settingsWin = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    x:
      catBounds.x +
      SETTINGS_OFFSET_X,

    y: catBounds.y + SETTINGS_OFFSET_Y,

    frame: false,
    resizable: false,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.mjs"
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    settingsWin.loadURL(
      `${VITE_DEV_SERVER_URL}#/settings`
    )
  } else {
    settingsWin.loadFile(
      path.join(RENDERER_DIST, "index.html"),
      {
        hash: "settings",
      }
    )
  }

  settingsWin.on("closed", () => {
    settingsWin = null
  })
}

app.on('window-all-closed', () => {
  ipcMain.removeHandler('read-clipboard-text')
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(()=>{
  DATA_PATH = path.join(
    app.getPath("userData"),
    "data.json"
  )


  loadData();
  createWindow();
  win?.webContents.once("did-finish-load", () => {
    if (fixedMessage.trim() !== "") {
      createMessageWindow()
    }
  })

  let isTyping = false;
  let typingTimeout : NodeJS.Timeout;


  uIOhook.on("keydown",()=>{
    if(!isTyping){
      isTyping=true
      console.log("typing started");

      win?.webContents.send("typing-started")
    }
    clearTimeout(typingTimeout!)
    typingTimeout = setTimeout(() => {
      isTyping = false
      console.log("user stopped typing")
      win?.webContents.send("typing-stopped")
    }, 1000);
    
    
  })

  uIOhook.start()

})
