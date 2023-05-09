"use strict"

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  getSettings: () => ipcRenderer.sendSync("get-settings"),
  setSettings: (jsonSettings) => ipcRenderer.send("set-settings", jsonSettings),
  setSize: (w, h, showMenu) => ipcRenderer.send("set-size", w, h, showMenu),
  getSentences: (file) => ipcRenderer.sendSync("get-sentences", file),
  getDict: (wordsFolder, lemmaPos) => ipcRenderer.sendSync("get-dict", wordsFolder, lemmaPos),
  getSoundDataUri: (audioFolder, sound) => ipcRenderer.sendSync("get-sound-data-uri", audioFolder, sound),
  selectFolder: () => ipcRenderer.invoke('dialog:open-directory')
});
