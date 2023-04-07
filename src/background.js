"use strict"

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

const path = require("path");
const fs = require("fs");

require("@electron/remote/main").initialize();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {

  ipcMain.on("get-sentences", (event) => {
    try {
      let json = fs.readFileSync("C:/Dev/droopy/greynir/jimny_sentences.json");
      let sentences = JSON.parse(json);
      json = fs.readFileSync("C:/Dev/jimny/jimny_sentences_audio.json");
      let sentencesAudio = JSON.parse(json);
      sentences.push(...sentencesAudio);
      event.returnValue = sentences;
    } catch (err) {
      event.returnValue = [];
    }
  });

  ipcMain.on("get-dict", (event, lemmaPos) => {
    let f = path.join("C:/Dev/droopy/greynir/jimny_words", `${lemmaPos}.json`);
    try {
      const jsonString = fs.readFileSync(f);
      let html = JSON.parse(jsonString);
      event.returnValue = html;
    } catch (err) {
      event.returnValue = { dict: `File not found: ${lemmaPos}.json` };
    }
  });

  ipcMain.on("get-sound-data-uri", (event, sound) => {
    let f = path.join("C:/Data/Islandais/samromur", sound);
    try {
      const data = fs.readFileSync(f).toString("base64");
      const dataUri = `data:audio/flac;base64,${data}`; 
      event.returnValue = dataUri;
    } catch (err) {
      event.returnValue = "";
    }
  });

  ipcMain.on("set-size", (event, w, h) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setSize(w, h);
  });

  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // /* YM */ nodeIntegration: false, // process.env.ELECTRON_NODE_INTEGRATION,
      // /* YM */ contextIsolation: false, // !process.env.ELECTRON_NODE_INTEGRATION,
      // /* YM */ enableRemoteModule: false,
      // /* YM */ preload: path.resolve(path.join(__dirname, "preload.js")),
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install: ", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
