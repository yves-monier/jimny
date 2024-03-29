<script>
// import { computed, ref } from "vue";
import Search from "./components/Search";
import SentenceViewer from "./components/SentenceViewer";
import Settings from "./components/Settings";
import Help from "./components/Help";
import { computed, reactive, ref } from "vue";
import { useKeypress } from 'vue3-keypress'

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
    Help,
  },
  setup() {
    const onUp = () => {
      onNextSentence(1);
    };

    const onDown = () => {
      onNextSentence(-1);
    };

    useKeypress({
      keyEvent: "keyup",
      keyBinds: [
        {
          keyCode: 40,
          success: onDown,
        },
        {
          keyCode: 38,
          success: onUp,
        },
      ],
    });

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

    const appSettings = window.electronAPI.getSettings();
    let settings = reactive(appSettings);

    let sentences = [];
    let total = 0;
    try {
      sentences = window.electronAPI.getSentences(settings.sentencesFile);
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
      large: true,
    });

    const settingsVisible = ref(false);
    const onSettings = () => {
      settingsVisible.value = true; //!settingsVisible.value;
    };
    const onCloseSettings = (newSettings) => {
      console.log(`onCloseSettings: ${JSON.stringify(newSettings)}`);
      if (newSettings) {
        window.electronAPI.setSettings(JSON.stringify(newSettings));
        Object.keys(newSettings).forEach(k => {
          settings[k] = newSettings[k];
        });
      }
      settingsVisible.value = false;
    };

    const helpVisible = ref(false);
    const onHelp = () => {
      helpVisible.value = true;
    };
    const onCloseHelp = () => {
      helpVisible.value = false;
    };

    const onSize = (large) => {
      stateViewer.large = large;
      if (large) {
        window.electronAPI.setSize(800, 600, true);
      } else {
        window.electronAPI.setSize(500, 200, false);
      }
    };

    let intervalId = undefined;

    const onStopTimeout = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined
      }
      // console.log(`Stop timeout`)
    };

    const doStartTimeout = (arg) => {
      if (settings.autobrowse) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        let delay = 1000 * Math.max(settings.autobrowseDuration, arg || settings.autobrowseDuration);
        // console.log(`doStartTimeout ${delay} ms`)
        intervalId = setInterval(() => {
          doNextSentence(1);
        }, delay);
      }
    };

    const doNextSentence = (step) => {
      let current = stateViewer.index;
      let rewound = false;
      let foundNext = false;
      while (!foundNext) {
        stateViewer.index = stateViewer.index + step;
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

    const onStartTimeout = (arg) => {
      // console.log(`Start timeout: ${arg}`)
      doStartTimeout(arg);
    };

    const onNextSentence = (step) => {
      if (settings.autobrowse) {
        doStartTimeout();
      }
      doNextSentence(step);
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

    return { sentences, stateViewer, helpVisible, onHelp, onCloseHelp, settingsVisible, settings, onSettings, onCloseSettings, onSize, onStopTimeout, onStartTimeout, onSelectSentence, onNextSentence, onPause, flags, onToggleFlag };
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
    <div class="toolbar-item nav">
      <span class="nav-index">{{ 1 + stateViewer.index }} / {{ stateViewer.total
      }}</span>
      <button class="icon-button nav-prev" @click="onNextSentence(-1)"></button>
      <button class="icon-button nav-next" @click="onNextSentence(1)"></button>
      <button class="icon-button nav-pause" :disabled="settings.autoplay ? null : 'disabled'" @click="onPause"></button>
    </div>
    <Search class="toolbar-item  search" :sentences="sentences" @select-sentence="onSelectSentence" />
    <div class="toolbar-item actions">
      <button v-if="stateViewer.large" class="icon-button action-collapse" @click="onSize(false)"></button>
      <button v-else class="icon-button action-expand" @click="onSize(true)"></button>
      <button class="icon-button action-settings" @click="onSettings"></button>
      <button class="icon-button action-help" @click="onHelp"></button>
    </div>
  </div>
  <SentenceViewer @stop-timeout="onStopTimeout" @start-timeout="onStartTimeout" :viewed="stateViewer"
    :settings="settings" />
  <Settings v-if="settingsVisible" :settings="settings" @close="onCloseSettings" />
  <Help v-if="helpVisible" @close="onCloseHelp" />
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
  outline: 0;
  border-radius: 12px;

  &:hover:not(:disabled) {
    background-color: #ddd;
  }

  &:focus:not(:disabled) {
    box-shadow: inset 0px 0px 0px 1px #eee;
  }

  &:disabled {
    opacity: 0.2;
  }
}

.nav {
  padding-left: 8px;
  padding-right: 8px;

  .nav-index {
    display: none;
  }

  .nav-prev {
    background-image: url(./assets/prev.svg);
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

  .action-collapse {
    background-image: url(./assets/collapse.svg);
  }

  .action-expand {
    background-image: url(./assets/expand.svg);
  }

  .action-settings {
    background-image: url(./assets/settings.svg);
  }

  .action-help {
    background-image: url(./assets/help.svg);
  }

  .action-pause {
    // background-image: url(./assets/pause.svg);
    display: none;
  }
}
</style>