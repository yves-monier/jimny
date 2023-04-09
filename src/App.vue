<script>
// import { computed, ref } from "vue";
import Search from "./components/Search";
import SentenceViewer from "./components/SentenceViewer";
import { computed, reactive } from "vue";

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
    });

    let intervalId = undefined;

    const onStopTimeout = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined
      }
      // console.log(`Stop timeout`)
    };

    const useTimeout = false;

    const doStartTimeout = () => {
      if (useTimeout) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
          doNextSentence();
        }, 10000)
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
      if (useTimeout) {
        doStartTimeout();
      } else {
        doNextSentence();
      }
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

    return { sentences, stateViewer, onStopTimeout, onStartTimeout, onSelectSentence, onNextSentence, flags, onToggleFlag };
  },
};
</script>

<template>
  <header>
    <div class="toolbar">
      <div class="flags">
        <div :class="['flag', 'flag-FR', `flag-${flags['FR']}`]" @click="onToggleFlag($event, 'FR')"></div>
        <div :class="['flag', 'flag-UK', `flag-${flags['UK']}`]" @click="onToggleFlag($event, 'UK')"></div>
        <div :class="['flag', 'flag-audio', `flag-${flags['audio']}`]" @click="onToggleFlag($event, 'audio')"></div>
      </div>
      <div class="actions">
        <div class="pause"></div>
      </div>
      <Search class="search" :sentences="sentences" @select-sentence="onSelectSentence" />
    </div>
  </header>
  <SentenceViewer @stop-timeout="onStopTimeout" @start-timeout="onStartTimeout" @next-sentence="onNextSentence"
    :viewed="stateViewer" />
</template>

<style lang="scss">
.container {
  width: 100%;
}

header {}

.toolbar {
  display: flex;
}

.flags {
  display: flex;
}

.flag {
  width: 24px;
  height: 16px;
  background-size: cover;
  border: 3px solid transparent;
}

.flag-FR {
  background-image: url("./assets/flags/flag_FR.jpg");
}

.flag-UK {
  background-image: url("./assets/flags/flag_UK.jpg");
}

.flag-audio {
  background-image: url("./assets/flags/flag_audio.jpg");
}

.flag-any {
  border-color: white;
}

.flag-on {
  border-color: green;
}

.flag-off {
  border-color: red;
}

.actions {
  margin-left: 0.5rem;
}

.search {
  margin-left: 0.5rem;
}
</style>