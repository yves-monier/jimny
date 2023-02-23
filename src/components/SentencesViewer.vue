<script>
import { ref } from 'vue'

export default {
  props: {
    sentences: { type: Array, default: () => [] },
  },
  components: {},
  // setup(_, { emit }) {
  //   const onFileClick = (file) => {
  //     if (file.directory) emit("folderclick", file);
  //   };
  //   return { onFileClick };
  // },
  setup(props) {
    const idx = ref(0);
    // const current = ref(props.sentences[idx.value]);

    let intervalId = undefined;

    const onStopTimeout = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined
      }
      console.log(`Stop timeout`)
    };
    const onStartTimeout = () => {
      console.log(`Start timeout`)
      intervalId = setInterval(() => {
        idx.value = idx.value + 1;
      }, 3000)
    };

    console.log(`Sentences: ${props.sentences.length}`)

    onStartTimeout();

    return { idx, onStopTimeout, onStartTimeout };
  },
};
</script>

<template>
  <h1>sentences: {{ sentences.length }}</h1>
  <h1 @mouseenter="onStopTimeout()" @mouseleave="onStartTimeout()">{{ sentences[idx]["icelandic"] }}</h1>
</template>

<style scoped></style>