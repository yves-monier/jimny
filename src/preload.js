"use strict"

const { contextBridge, ipcRenderer } = require('electron');

// window.ymym = "ym";

contextBridge.exposeInMainWorld("electronAPI", {
  setSize: (w, h) => ipcRenderer.send("set-size", w, h),
  getDict: (lemmaPos) => ipcRenderer.sendSync("get-dict", lemmaPos)
});

// console.log("preload done");