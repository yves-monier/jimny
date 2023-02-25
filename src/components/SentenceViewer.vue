<script>
import fs from "fs";
import path from "path";
import { computed } from 'vue'

export default {
  props: {
    viewed: { type: Object, default: () => { } },
  },
  components: {},
  // setup(_, { emit }) {
  //   const onFileClick = (file) => {
  //     if (file.directory) emit("folderclick", file);
  //   };
  //   return { onFileClick };
  // },
  setup(props) {
    const dict = computed(() => {
      let d = new Map();
      for (let greynir of props.viewed.sentence.greynir) {
        let lemma = greynir.lemma;
        let pos = greynir.pos.replaceAll('"', "");
        let lemmaPos = `${lemma}+${pos}`;
        let f = path.join("C:/Dev/droopy/greynir/jimny_words", `${lemmaPos}.json`);
        try {
          console.log(`read file: ${f}`)
          const jsonString = fs.readFileSync(f);
          let html = JSON.parse(jsonString);
          d.set(lemmaPos, html);
          console.log(`dict ${lemmaPos}: ${JSON.stringify(html)}`);
        } catch (err) {
          console.error(`SentenceViewer: ${err}`);
        }
      }
      console.log(`dict: ${JSON.stringify(d)}`);
      return [...d];
    });

    return { dict };
  },
};
</script>

<template>
  <div class="sentence" @mouseenter="$emit('stop-timeout')" @mouseleave="$emit('start-timeout')">
    <header>{{ 1 + viewed.index }} / {{ viewed.total }}</header>
    <div class="icelandic">{{ viewed.sentence.icelandic }}</div>
    <div class="greynir-analysis">
      <div v-for="(greynir, index) in viewed.sentence.greynir" :key="`greynir-${index}`" class="greynir-word">
        <span class="greynir-lemma">{{ greynir.lemma }}</span><span class="greynir-pos">{{ greynir.pos }}</span>
      </div>
    </div>
    <div class="detail">
      <div v-if="viewed.sentence.english" class="english">{{ viewed.sentence.english }}</div>
      <div v-if="viewed.sentence.french" class="french">{{ viewed.sentence.french }}</div>
    </div>
    <div class="dict">
      <div v-for="(entry, index) in dict" :key="index" class="dict-html">
        <div v-html="entry[1].dict"></div>
        <!-- TODO read lemma.pos.json files, with html content -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.sentence {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

header {
  margin-bottom: 1rem;
  text-align: right;
}

.icelandic {
  margin-bottom: 1rem;
}

.english,
.french {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.greynir-analysis {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.greynir-word {
  display: inline-block;
  margin-right: 0.3rem;
}

.greynir-lemma {}

.greynir-pos {
  font-weight: bold;
}

.greynir-lemma::after {
  content: "+";
}
</style>