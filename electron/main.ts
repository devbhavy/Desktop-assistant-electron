import { app, BrowserWindow, clipboard, ipcMain,screen,Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {uIOhook} from 'uiohook-napi'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null


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

    targetWindow.setBounds({
      x: currentCursor.x - dragOffsetX,
      y: currentCursor.y - dragOffsetY,
      width: fixedWidth,
      height: fixedHeight,
    });
  }, 16);
});

ipcMain.on("stop-drag", () => {
  if (dragTimer) {
    clearInterval(dragTimer);
    dragTimer = null;
  }
});



ipcMain.on("show-cat-menu", (event) => {
  const targetWindow =
    BrowserWindow.fromWebContents(event.sender);

  if (!targetWindow) return;

  const menu = Menu.buildFromTemplate([
    {
      label: "Fixed message",
      click: () => {
        console.log("Fixed message clicked");
      },
    },
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
  });
});
function createWindow() {
  // let win: BrowserWindow | null

  
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
