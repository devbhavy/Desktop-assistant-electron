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

const MESSAGE_OFFSET_X = -45;
const MESSAGE_OFFSET_Y = -100;

const MESSAGE_WIDTH = 350;
const MESSAGE_HEIGHT = 100;


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
  }, 16);
});

ipcMain.on("stop-drag", () => {
  if (dragTimer) {
    clearInterval(dragTimer);
    dragTimer = null;
  }
});
let fixedMessage = "";



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
        console.log("Reminders clicked");
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
