import { app, BrowserWindow, clipboard, ipcMain,screen,Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {uIOhook} from 'uiohook-napi'
import { WebContents } from 'electron'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))



process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let messageWin: BrowserWindow | null = null;
let reminderWin: BrowserWindow | null = null;
let reminderAlertWin: BrowserWindow | null = null

const MESSAGE_OFFSET_X = -45;
const MESSAGE_OFFSET_Y = -100;

const MESSAGE_WIDTH = 350;
const MESSAGE_HEIGHT = 100;


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



let dragTimer: NodeJS.Timeout | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let fixedWidth = 0;
let fixedHeight = 0;


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
  }, 16);
});

ipcMain.on("stop-drag", () => {
  if (dragTimer) {
    clearInterval(dragTimer);
    dragTimer = null;
  }
});
let fixedMessage = "";

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

    // Find and schedule the next selected weekday
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



const reminderTimers = new Map<string, NodeJS.Timeout>()

ipcMain.on("show-cat-menu", (event) => {
  const targetWindow =
    BrowserWindow.fromWebContents(event.sender);

  if (!targetWindow) return;

  const fixedMessageItems = fixedMessage
    ? [
        // {
        //   label: "Fixed message",
        //   click: () => {
        //     createMessageWindow();
        //   },
        // },
        {
          label: "Remove fixed message",
          click: () => {
            fixedMessage = "";

            if (
              messageWin &&
              !messageWin.isDestroyed()
            ) {
              messageWin.close();
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

  const menu = Menu.buildFromTemplate([
    ...fixedMessageItems,

    {
      label: "Reminders",
      click: () => {
        createReminderWindow()
      },
    },
    {
      label: "Pomodoro",
      click: () => {
        console.log("Pomodoro clicked");
      },
    },
    {
      label: "Break Stretch",
      click: () => {
        console.log("Break Stretch clicked");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Settings",
      click: () => {
        console.log("Settings clicked");
      },
    },
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


ipcMain.handle("set-fixed-message", (_, message: string) => {
  fixedMessage = message;

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

      // While dragging, don't mess with mouse handling
      if (dragTimer) return;

      const cursor = screen.getCursorScreenPoint();
      const bounds = targetWindow.getBounds();

      // Cursor position relative to BrowserWindow
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
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  ipcMain.removeHandler('read-clipboard-text')
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(()=>{
  createWindow();


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
