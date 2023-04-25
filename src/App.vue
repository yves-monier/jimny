<script>
// import { computed, ref } from "vue";
import Search from "./components/Search";
import SentenceViewer from "./components/SentenceViewer";
import Settings from "./components/Settings";
import { computed, reactive, ref } from "vue";

// const formatSize = (size) => {
//   var i = Math.floor(Math.log(size) / Math.log(1024));
//   return (
//     (size / Math.pow(1024, i)).toFixed(2) * 1 +
//     " " +
//     ["B", "kB", "MB", "GB", "TB"][i]
//   );
// };

export default {
  name: "App",
  components: {
    Search,
    SentenceViewer,
    Settings,
  },
  setup() {
    // const path = ref(app.getAppPath());
    // const files = computed(() => {
    //   const fileNames = fs.readdirSync(path.value);
    //   return fileNames
    //     .map((file) => {
    //       try {
    //         const stats = fs.statSync(pathModule.join(path.value, file));
    //         return {
    //           name: file,
    //           size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
    //           directory: stats.isDirectory(),
    //         };
    //       } catch (error) {
    //         return {
    //           name: file,
    //           size: "",
    //           directory: false,
    //         };
    //       }
    //     })
    //     .sort((a, b) => {
    //       if (a.directory === b.directory) {
    //         return a.name.localeCompare(b.name);
    //       }
    //       return a.directory ? -1 : 1;
    //     });
    // });

    // const back = () => {
    //   path.value = pathModule.dirname(path.value);
    //   console.log(`path.value: ${path.value}`);
    // };
    // const open = (folder) => {
    //   path.value = pathModule.join(path.value, folder);
    // };
    // const searchString = ref("");
    // const filteredFiles = computed(() => {
    //   return searchString.value
    //     ? files.value.filter((s) => s.name.startsWith(searchString.value))
    //     : files.value;
    // });
    //
    // return {
    //   path,
    //   open,
    //   back,
    //   files,
    //   searchString,
    //   filteredFiles,
    // };

    const flags = reactive({ FR: "any", UK: "any", audio: "any" });

    const onToggleFlag = (ev, lang) => {
      let prev = flags[lang];
      if (flags[lang] === "any") {
        flags[lang] = "on";
      } else if (flags[lang] === "on") {
        flags[lang] = "off";
      } else /* === "off" */ {
        flags[lang] = "any";
      }
      let atLeastOneNotOff = Object.entries(flags).find(e => e[1] !== "off");
      if (atLeastOneNotOff) {
        doStartTimeout();
      } else {
        flags[lang] = prev;
      }
    };

    let sentences = [];
    let total = 0;
    try {
      // const jsonString = fs.readFileSync("C:/Dev/droopy/greynir/jimny_sentences.json");
      // sentences = JSON.parse(jsonString);
      sentences = window.electronAPI.getSentences();
      total = sentences.length;
    } catch (err) {
      console.log(err);
    }

    const stateViewer = reactive({
      total,
      index: 0,
      sentence: computed(
        () => { return sentences[stateViewer.index] }
      ),
      autoplay: true,
    });

    let settings = reactive({ autoplay: stateViewer.autoplay, sentencesFile: "C:\\Dev\\droopy\\greynir\\jimny_sentences.json", wordsFolder: "C:\\Dev\\droopy\\greynir\\jimny_words", audioFolder: "C:\\Data\\Islandais\\samromur", autobrowse: false, autobrowseDuration: 5 });

    const settingsVisible = ref(false);
    const onSettings = () => {
      settingsVisible.value = true; //!settingsVisible.value;
    };
    const onCloseSettings = (newSettings) => {
      console.log(`onCloseSettings: ${JSON.stringify(newSettings)}`);
      if (newSettings) {
        Object.keys(newSettings).forEach(k => {
          settings[k] = newSettings[k];
        });
        stateViewer.autoplay = newSettings.autoplay;
      }
      settingsVisible.value = false;
    };

    let intervalId = undefined;

    const onStopTimeout = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined
      }
      // console.log(`Stop timeout`)
    };

    const doStartTimeout = () => {
      if (settings.autobrowse) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
          doNextSentence();
        }, 1000 * settings.autobrowseDuration);
      }
    };

    const doNextSentence = () => {
      let current = stateViewer.index;
      let rewound = false;
      let foundNext = false;
      while (!foundNext) {
        stateViewer.index = stateViewer.index + 1;
        if (stateViewer.index == total) {
          if (!rewound) {
            stateViewer.index = 0;
            rewound = true;
          } else {
            stateViewer.index = current;
            return;
          }
        }
        foundNext = true;
        if (flags.UK == "on") {
          if (!stateViewer.sentence.english) {
            foundNext = false
          }
        } else if (flags.UK == "off") {
          if (stateViewer.sentence.english) {
            foundNext = false
          }
        }
        if (flags.FR == "on") {
          if (!stateViewer.sentence.french) {
            foundNext = false
          }
        } else if (flags.FR == "off") {
          if (stateViewer.sentence.french) {
            foundNext = false
          }
        }
        if (flags.audio == "on") {
          if (!stateViewer.sentence.audio) {
            foundNext = false
          }
        } else if (flags.audio == "off") {
          if (stateViewer.sentence.audio) {
            foundNext = false
          }
        }
      }
    };

    const onStartTimeout = () => {
      // console.log(`Start timeout`)
      doStartTimeout();
    };

    const onNextSentence = () => {
      if (settings.autobrowse) {
        doStartTimeout();
      }
      doNextSentence();
    };

    const onPause = () => {
      console.log("onPause");
    };

    const onSelectSentence = (sentence) => {
      for (let ii = 0; ii < sentences.length; ii++) {
        if (sentences[ii].id == sentence.id) {
          stateViewer.index = ii;
          doStartTimeout();
          break;
        }
      }
    };

    doStartTimeout();

    return { sentences, stateViewer, settingsVisible, settings, onSettings, onCloseSettings, onStopTimeout, onStartTimeout, onSelectSentence, onNextSentence, onPause, flags, onToggleFlag };
  },
};
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-item flags">
      <div :class="['flag', 'flag-FR', `flag-${flags['FR']}`]" @click="onToggleFlag($event, 'FR')"></div>
      <div :class="['flag', 'flag-UK', `flag-${flags['UK']}`]" @click="onToggleFlag($event, 'UK')"></div>
      <div :class="['flag', 'flag-audio', `flag-${flags['audio']}`]" @click="onToggleFlag($event, 'audio')"></div>
    </div>
    <Search class="toolbar-item  search" :sentences="sentences" @select-sentence="onSelectSentence" />
    <div class="toolbar-item nav">
      <span class="nav-index">{{ 1 + stateViewer.index }} / {{ stateViewer.total
      }}</span>
      <button class="icon-button nav-next" @click="onNextSentence"></button>
      <button class="icon-button nav-pause" @click="onPause"></button>
    </div>
    <div class="toolbar-item actions">
      <button class="icon-button action-settings" @click="onSettings"></button>
      <button class="icon-button action-pause"></button>
    </div>
  </div>
  <SentenceViewer @stop-timeout="onStopTimeout" @start-timeout="onStartTimeout" :viewed="stateViewer" />
  <Settings v-if="settingsVisible" :settings="settings" @close="onCloseSettings" />
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  height: 3rem;
}

.toolbar-item {
  display: flex;
  margin-left: 0.5rem;
  border: 1px solid #bbb;
  border-radius: 10px;
  height: 30px;
  align-items: center;
}

.flags {
  padding-left: 4px;
  padding-right: 4px;

  .flag {
    width: 29px;
    height: 20px;
    background-size: contain;
    border: 3px solid transparent;

    &.flag-FR {
      background-image: url("./assets/flags/flag_FR.jpg");
    }

    &.flag-UK {
      background-image: url("./assets/flags/flag_UK.jpg");
    }

    &.flag-audio {
      background-image: url("./assets/flags/flag_audio.jpg");
    }

    &.flag-any {
      border-color: white;
    }

    &.flag-on {
      border-color: green;
    }

    &.flag-off {
      border-color: red;
    }
  }
}

.icon-button {
  display: block;
  text-indent: -9999px;
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center center;

  &:hover, &:focus {
    background-color: #ddd;
    border-radius: 12px;
    outline: 0;
  }
}

.nav {
  padding-left: 8px;
  padding-right: 8px;

  .nav-index {
    display: none;
  }

  .nav-next {
    background-image: url(./assets/next.svg);
  }

  .nav-pause {
    background-image: url(./assets/pause.svg);
  }
}

.actions {
  margin-left: auto;
  margin-right: 0.5rem;
  padding-left: 4px;
  padding-right: 4px;

  .action-settings {
    background-image: url(./assets/settings.svg);
  }

  .action-pause {
    // background-image: url(./assets/pause.svg);
    display: none;
  }
}
</style>