<script>
// import { ref } from 'vue'

export default {
  props: {
    current: { type: Object, default: () => { } },
  },
  components: {},
  // setup(_, { emit }) {
  //   const onFileClick = (file) => {
  //     if (file.directory) emit("folderclick", file);
  //   };
  //   return { onFileClick };
  // },
  // setup(props) {
  // },
};
</script>

<template>
  <div @mouseenter="$emit('stop-timeout')" @mouseleave="$emit('start-timeout')">
    <header>{{ 1 + current.index }} / {{ current.total }}</header>
    <div class="icelandic">{{ current.sentence.icelandic }}</div>
    <div class="greynir-analysis">
      <div v-for="(greynir, index) in current.sentence.greynir" :key="index" class="greynir-word">
        <span class="greynir-lemma">{{ greynir.lemma }}</span><span class="greynir-pos">{{ greynir.pos }}</span>
      </div>
    </div>
    <div class="detail">
      <div v-if="current.sentence.english" class="english">{{ current.sentence.english }}</div>
      <div v-if="current.sentence.french" class="french">{{ current.sentence.french }}</div>
    </div>
  </div>
</template>

<style scoped>
.greynir-analysis {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.greynir-word {
  display: inline-block;
  margin-right: 0.3rem;
}

.greynir-lemma {
}

.greynir-pos {
  font-weight: bold;
}

.greynir-lemma::after {
  content: "+";
}
</style>