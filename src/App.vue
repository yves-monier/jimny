<script>
import fs from "fs";
// import { app } from "@electron/remote";
// import { computed, ref } from "vue";
// import FilesViewer from "./components/FilesViewer";
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
    // FilesViewer,
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

    const flags = reactive({ "FR": true, "UK": true });

    const onToggleFlag = (ev, lang) => {
      flags[lang] = !flags[lang];
      let hasFlagOn = false;
      for (const [/*lang*/, b] of Object.entries(flags)) {
        hasFlagOn = hasFlagOn || b;
      }
      if (hasFlagOn) {
        doStartTimeout();
      } else {
        flags[lang] = !flags[lang];
      }
    };

    let sentences = [];
    let total = 0;
    try {
      const jsonString = fs.readFileSync("C:/Dev/droopy/greynir/jimny_sentences.json");
      sentences = JSON.parse(jsonString);
      total = sentences.length;
    } catch (err) {
      console.log(err);
    }

    const state = reactive({
      total,
      index: 0,
      sentence: computed(
        () => { return sentences[state.index] }
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
      let foundNext = false;
      while (!foundNext) {
        state.index = state.index + 1;
        if (state.index == total) {
          state.index = 0;
        }
        foundNext = true;
        if (flags.UK) {
          if (!state.sentence.english) {
            foundNext = false
          }
        } else {
          if (state.sentence.english) {
            foundNext = false
          }
        }
        if (flags.FR) {
          if (!state.sentence.french) {
            foundNext = false
          }
        } else {
          if (state.sentence.french) {
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
          state.index = ii;
          doStartTimeout();
          break;
        }
      }
    };

    doStartTimeout();

    return { sentences, state, onStopTimeout, onStartTimeout, onSelectSentence, onNextSentence, flags, onToggleFlag };
  },
};
</script>

<template>
  <header>
    <div class="toolbar">
      <div class="flags">
        <div :class="['flag', 'flag-FR', !flags['FR'] && 'flag-off']" @click="onToggleFlag($event, 'FR')"></div>
        <div :class="['flag', 'flag-UK', !flags['UK'] && 'flag-off']" @click="onToggleFlag($event, 'UK')"></div>
      </div>
      <div class="actions">
        <div class="pause"></div>
      </div>
      <Search :sentences="sentences" @select-sentence="onSelectSentence" />
    </div>
  </header>
  <SentenceViewer @stop-timeout="onStopTimeout" @start-timeout="onStartTimeout" @next-sentence="onNextSentence"
    :viewed="state" />
</template>

<style lang="scss">
.container {
  width: 100%;
}

header {}

.flag {
  width: 24px;
  height: 16px;
  background-size: cover;
}

.flag-FR {
  background-image: url("./assets/flags/flag_FR.jpg");
}

.flag-UK {
  background-image: url("./assets/flags/flag_UK.jpg");
}

.flag-off {
  opacity: 0.5;
}
</style>