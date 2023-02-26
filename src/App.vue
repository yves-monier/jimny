<template>
  <div class="container mt-2">
    <Search :sentences="sentences" @select-sentence="onSelectSentence" />
    <SentenceViewer @stop-timeout="onStopTimeout" @start-timeout="onStartTimeout" :viewed="state" />
  </div>
</template>

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

    const doStartTimeout = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(() => {
        state.index = state.index + 1;
        if (state.index == total) {
          state.index = 0;
        }
      }, 10000)
    };

    const onStartTimeout = () => {
      // console.log(`Start timeout`)
      doStartTimeout();
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

    return { sentences, state, onStopTimeout, onStartTimeout, onSelectSentence };
  },
};
</script>

<style lang="scss">
header {
  margin-bottom: 1rem;
}
</style>