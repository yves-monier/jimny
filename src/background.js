"use strict"

import { app, protocol, BrowserWindow, ipcMain, dialog } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";

// const { load } = require('cheerio');
import { load } from "cheerio";

const isDevelopment = process.env.NODE_ENV !== "production";

const path = require("path");
const fs = require("fs");

require("@electron/remote/main").initialize();

const helpers = require("@/services/helpers.js");

let abbreviations = [
  // { "abbr": "acc", "is": "?olfall", "en": "accusative" },
  // { "abbr": "adj", "is": "l?singaror?", "en": "adjective" },
  // { "abbr": "adj comp", "is": "l?singaror? ? mi?stigi", "en": "comparative adjective" },
  // { "abbr": "adj (dat)", "is": "l?singaror? sem tekur me? s?r ??gufall", "en": "adjective that governs the dative case" },
  // { "abbr": "adj indecl", "is": "?beygjanlegt l?singaror?", "en": "indeclinable adjective" },
  // { "abbr": "adj n", "is": "l?singaror? ? hvorugkyni", "en": "neuter adjective" },
  // { "abbr": "adj pl", "is": "l?singaror? ? fleirt?lu", "en": "plural adjective" },
  // { "abbr": "adj superl", "is": "l?singaror? ? efstastigi", "en": "superlative adjective" },
  // { "abbr": "adv", "is": "atviksor?", "en": "adverb" },
  // { "abbr": "adv comp", "is": "atviksor? ? mi?stigi", "en": "comparative adverb" },
  // { "abbr": "adv superl", "is": "atviksor? ? efstastigi", "en": "superlative adverb" },
  // { "abbr": "comp", "is": "mi?stig", "en": "comparative" },
  // { "abbr": "conj", "is": "samtenging", "en": "conjunction" },
  // { "abbr": "dat", "is": "??gufall", "en": "dative" },
  // { "abbr": "dat+acc", "is": "er merki vi? s?gn sem tekur me? s?r andlag ? ??gufalli og ?olfalli", "en": "indicates a verb with dative + accusative objects" },
  { "abbr": "e-a", "is": "einhverja", "en": "somebody (feminine)" },
  // { "abbr": "e-�", "is": "eitthva�", "en": "something" },
  { "abbr": "e-\u00f0", "is": "eitthva\u00f0", "en": "something" },
  { "abbr": "e-n", "is": "einhvern", "en": "somebody (masculine)" },
  { "abbr": "e-m", "is": "einhverjum", "en": "somebody" },
  { "abbr": "e-s", "is": "einhvers", "en": "somebody's" },
  { "abbr": "e-u", "is": "einhverju", "en": "something" },
  // { "abbr": "esp", "is": "einkum", "en": "especially" },
  // { "abbr": "f", "is": "kvenkyn/nafnor? ? kvenkyni", "en": "feminine/feminine noun" },
  // { "abbr": "f indecl", "is": "?beygjanlegt nafnor? ? kvenkyni", "en": "indeclinable feminine noun" },
  // { "abbr": "f pl", "is": "fleirt?lunafnor? ? kvenkyni", "en": "feminine plural noun" },
  // { "abbr": "gen", "is": "eignarfall", "en": "genitive" },
  // { "abbr": "impers", "is": "?pers?nuleg notkun", "en": "impersonal usage" },
  // { "abbr": "indic", "is": "frams?guh?ttur", "en": "indicative" },
  // { "abbr": "interj", "is": "upphr?pun", "en": "interjection" },
  // { "abbr": "m", "is": "karlkyn/nafnor? ? karlkyni", "en": "masculine/masculine noun" },
  // { "abbr": "m?lfr", "is": "m?lfr??i", "en": "grammar" },
  // { "abbr": "m pl", "is": "fleirt?lunafnor? ? karlkyni", "en": "masculine plural noun" },
  // { "abbr": "n", "is": "hvorugkyn/nafnor? ? hvorugkyni", "en": "neuter/neuter noun" },
  // { "abbr": "n indecl", "is": "?beygjanlegt nafnor?", "en": "indeclinable neuter noun" },
  // { "abbr": "n pl", "is": "fleirt?lunafnor? ? hvorugkyni", "en": "neuter plural noun" },
  // { "abbr": "num", "is": "t?luor?", "en": "numeral" },
  // { "abbr": "ofl", "is": "og fleira", "en": "and others" },
  // { "abbr": "pers", "is": "pers?na", "en": "person" },
  // { "abbr": "pl", "is": "fleirtala", "en": "plural" },
  // { "abbr": "poet", "is": "sk?ldskaparm?l", "en": "poetical/archaic" },
  // { "abbr": "pp", "is": "l?singarh?ttur ??t??ar", "en": "past participle" },
  // { "abbr": "prep", "is": "forsetning", "en": "preposition" },
  // { "abbr": "prep (acc)", "is": "forsetning sem st?rir ?olfalli", "en": "preposition that governs the accusative case" },
  // { "abbr": "prep (dat)", "is": "forsetning sem st?rir ??gufalli", "en": "preposition that governs the dative case" },
  // { "abbr": "prep (gen)", "is": "forsetning sem st?rir eignarfalli", "en": "preposition that governs the genitive case" },
  // { "abbr": "pron", "is": "fornafn", "en": "pronoun" },
  // { "abbr": "pron demon", "is": "?bendingarfornafn", "en": "demonstrative pronoun" },
  // { "abbr": "pron indef", "is": "??kve?i? fornafn", "en": "indefinite pronoun" },
  // { "abbr": "pron pl", "is": "fornafn ? fleirt?lu", "en": "pronoun plural" },
  // { "abbr": "pron poss", "is": "eignarfornafn", "en": "possessive pronoun" },
  // { "abbr": "pron refl", "is": "afturbeygt fornafn", "en": "reflexive pronoun" },
  // { "abbr": "prp", "is": "l?singarh?ttur n?t??ar", "en": "present participle" },
  // { "abbr": "refl", "is": "mi?mynd", "en": "reflexive, middle voice" },
  // { "abbr": "rel", "is": "tilv?sunaror?", "en": "relative" },
  // { "abbr": "sby", "is": "einhver", "en": "somebody" },
  // { "abbr": "sby's", "is": "einhvers/einhverrar", "en": "somebody's" },
  // { "abbr": "sg", "is": "eintala", "en": "singular" },
  // { "abbr": "skammst", "is": "skammst?fun", "en": "abbreviation" },
  // { "abbr": "sth", "is": "eitthva?", "en": "something" },
  // { "abbr": "st?r?fr", "is": "st?r?fr??i", "en": "mathematics" },
  // { "abbr": "UK", "is": "bresk stafsetning e?a m?lnotkun", "en": "British spelling or usage" },
  // { "abbr": "US", "is": "nor?uramer?sk stafsetning e?a m?lnotkun", "en": "N. American spelling or usage" },
  // { "abbr": "v aux", "is": "hj?lpars?gn", "en": "auxiliary verb" },
  // { "abbr": "v impers", "is": "?pers?nuleg s?gn", "en": "impersonal verb" },
  // { "abbr": "v refl", "is": "mi?myndars?gn", "en": "reflexive verb" }
];

let initAbbr = false;

// Credits https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegexp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function desabbreviate(html) {
  if (!initAbbr) {
    for (let i = 0; i < abbreviations.length; i++) {
      let a = abbreviations[i];
      let regex = new RegExp('(^| )(' + escapeRegexp(a.abbr) + ')( |$)', 'g');
      a.rx = regex;
    }
    initAbbr = true;
  }

  for (let i = 0; i < abbreviations.length; i++) {
    let a = abbreviations[i];
    // html = html.replace(a.rx, a.is);
    html = html.replace(a.rx, "$1<span class='abbr-is' title='" + a.is + " (" + a.en + ")'>$2</span>$3");
  }
  return html;
}

// List of HTML entities for escaping.
let htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

// Regex containing the keys listed immediately above.
let htmlEscaper = /[&<>"'/]/g;

// Escape a string for HTML interpolation.
function htmlEscape(string) {
  return ('' + string).replace(htmlEscaper, function (match) {
    return htmlEscapes[match];
  });
}

// eslint-disable-next-line no-unused-vars
function enrichIcelandic(html) {
  let $dictLookupHtml = load(html);
  $dictLookupHtml(".entry").each(function (i, objEntry) {
    let $entry = $dictLookupHtml(objEntry);

    let headwdObj = $dictLookupHtml(".headwd > .lemma", $entry);
    let headwd = "???";
    if (headwdObj.length > 0) {
      headwd = headwdObj[0].children.filter(function (node) {
        return node.nodeType == 3;
      })[0].nodeValue;
    }

    let hwFull = headwd;

    // search for '/' or '.' headword separator (see https://digicoll.library.wisc.edu/cgi-bin/IcelOnline/IcelOnline.TEId-idx?type=HTML&rgn=DIV1&id=IcelOnline.IEOrd&target=IcelOnline.IEOrd.Guide)
    let separatorPos = hwFull.indexOf('/');
    if (separatorPos == -1) {
      separatorPos = hwFull.indexOf('.');
    }
    if (separatorPos != -1) {
      let regex = new RegExp('\\/|\\.', 'g');
      hwFull = hwFull.replace(regex, ''); // e.g. "tal/a" => "tala"
    }

    let regexFull = /(~~)/g;
    let enrichmentFull = "<span class='hw-placeholder'>$1</span><span class='hw-actual'>" + htmlEscape(hwFull) + "</span>";
    let regexBeforeSeparator = /(~)/g;
    let hwBeforeSeparator = headwd;
    if (separatorPos != -1) {
      hwBeforeSeparator = hwBeforeSeparator.substring(0, separatorPos);
    }
    let enrichmentBeforeSeparator = "<span class='hw-placeholder'>$1</span><span class='hw-actual'>" + htmlEscape(hwBeforeSeparator) + "</span>";

    $dictLookupHtml(".orth, .usg"/*, entryElement*/, $entry).each(function (i, objOrth) {
      let $obj = $dictLookupHtml(objOrth);
      let html = $obj.html();
      let enrichedHtml = html.replace(regexFull, enrichmentFull); // tala, segja, sj?n, ...
      enrichedHtml = enrichedHtml.replace(regexBeforeSeparator, enrichmentBeforeSeparator); // tala, segja, sj?n
      enrichedHtml = desabbreviate(enrichedHtml);
      if (html !== enrichedHtml) {
        $obj.html(enrichedHtml);
      }
    });
  });
  let enrichedHtml = $dictLookupHtml.html();
  return enrichedHtml;
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {

  ipcMain.on("get-sentences", (event) => {
    try {
      let json = fs.readFileSync("C:/Dev/droopy/greynir/jimny_sentences.json");
      let sentences = JSON.parse(json);
      // json = fs.readFileSync("C:/Dev/jimny/jimny_sentences_audio.json");
      // let sentencesAudio = JSON.parse(json);
      // sentences.push(...sentencesAudio);
      helpers.shuffleArray(sentences);
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
      // let enrichedHtml = enrichIcelandic(html);
      // console.log(`enrichedHtml: ${enrichedHtml}`)
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

  ipcMain.on("set-size", (event, w, h, showMenu) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setSize(w, h);
    win.setMenuBarVisibility(showMenu);
  });

  ipcMain.handle('dialog:open-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
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
