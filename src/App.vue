<template>
  <SentencesViewer :sentences="sentences" />
  <!-- div class="container mt-2">
    <h4>{{ path }}</h4>
    <div class="form-group mt-4 mb-2">
      <input v-model="searchString" class="form-control form-control-sm" placeholder="File search" />
    </div>
    <FilesViewer :sentences="sentences" :files="filteredFiles" :nested="nested" @back="back" @folderclick="open($event.name)" />
  </div -->
</template>

<script>
import fs from "fs";
import pathModule from "path";

import { app } from "@electron/remote";
import { computed, ref } from "vue";

import SentencesViewer from "./components/SentencesViewer";
// import FilesViewer from "./components/FilesViewer";

const formatSize = (size) => {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
};

export default {
  name: "App",
  components: {
    SentencesViewer,
    // FilesViewer,
  },

  setup() {
    let sentences = [];
    try {
      const jsonString = fs.readFileSync("C:/Dev/droopy/greynir/jimny_sentences.json");
      sentences = JSON.parse(jsonString);
    } catch (err) {
      console.log(err);
    }
    const path = ref(app.getAppPath());
    const files = computed(() => {
      const fileNames = fs.readdirSync(path.value);
      return fileNames
        .map((file) => {
          try {
            const stats = fs.statSync(pathModule.join(path.value, file));
            return {
              name: file,
              size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
              directory: stats.isDirectory(),
            };
          } catch (error) {
            return {
              name: file,
              size: "",
              directory: false,
            };
          }
        })
        .sort((a, b) => {
          if (a.directory === b.directory) {
            return a.name.localeCompare(b.name);
          }
          return a.directory ? -1 : 1;
        });
    });

    const back = () => {
      path.value = pathModule.dirname(path.value);
      console.log(`path.value: ${path.value}`);
    };
    const open = (folder) => {
      path.value = pathModule.join(path.value, folder);
    };
    const searchString = ref("");
    const filteredFiles = computed(() => {
      return searchString.value
        ? files.value.filter((s) => s.name.startsWith(searchString.value))
        : files.value;
    });

    return {
      sentences,
      path,
      open,
      back,
      files,
      searchString,
      filteredFiles,
    };
  },
};
</script>

