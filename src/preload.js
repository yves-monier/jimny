"use strict"

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  setSize: (w, h, showMenu) => ipcRenderer.send("set-size", w, h, showMenu),
  getSentences: () => ipcRenderer.sendSync("get-sentences"),
  getDict: (lemmaPos) => ipcRenderer.sendSync("get-dict", lemmaPos),
  getSoundDataUri: (sound) => ipcRenderer.sendSync("get-sound-data-uri", sound),
  selectFolder: () => ipcRenderer.invoke('dialog:open-directory')
});
