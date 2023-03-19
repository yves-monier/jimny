<script>
import fs from "fs";
import path from "path";
import { computed, ref } from 'vue'
import CustomScrollbar from 'custom-vue-scrollbar';
import 'custom-vue-scrollbar/dist/style.css';

export default {
  props: {
    viewed: { type: Object, default: () => { } },
  },
  components: { CustomScrollbar },
  // setup(_, { emit }) {
  //   const onFileClick = (file) => {
  //     if (file.directory) emit("folderclick", file);
  //   };
  //   return { onFileClick };
  // },
  setup(props) {
    let dictElements = ref(null);

    const onGreynirEnter = (index) => {
      // console.log(`onGreynirEnter: ${index}`)
      current.value = index;

      dictElements.value[index].scrollIntoView();
    };
    const onGreynirLeave = (/*index*/) => {
      // console.log(`onGreynirLeave: ${index}`)
      current.value = -1;
    };

    const onDictEnter = (index) => {
      // console.log(`onDictEnter: ${index}`)
      current.value = index;
    };
    const onDictLeave = (/*index*/) => {
      // console.log(`onDictLeave: ${index}`)
      current.value = -1;
    };

    const onDictNav = (step = 1) => {
      current.value = current.value + step;
      console.log(`onDictNav: ${current.value}`)
    };

    const current = ref(-1);

    const dict = computed(() => {
      let d = new Map();
      for (let greynir of props.viewed.sentence.greynir) {
        let lemma = greynir.lemma;
        let pos = greynir.pos.replaceAll('"', "");
        let lemmaPos = `${lemma}+${pos}`;
        let f = path.join("C:/Dev/droopy/greynir/jimny_words", `${lemmaPos}.json`);
        try {
          // console.log(`read file: ${f}`)
          const jsonString = fs.readFileSync(f);
          let html = JSON.parse(jsonString);
          d.set(lemmaPos, html);
          // console.log(`dict ${lemmaPos}: ${JSON.stringify(html)}`);
        } catch (err) {
          console.error(`SentenceViewer: ${err}`);
          d.set(lemmaPos, { dict: `File not found: ${lemmaPos}.json` });
        }
      }
      return [...d]; // [ [lemma+pos, dict], ..., [lemma+pos, dict] ]
    });

    return { dict, current, onGreynirEnter, onGreynirLeave, onDictEnter, onDictLeave, onDictNav, dictElements };
  },
};
</script>

<template>
  <div class="sentence" @mouseenter="$emit('stop-timeout')" @mouseleave="$emit('start-timeout')">
    <header>{{ 1 + viewed.index }} / {{ viewed.total }} <button @click="$emit('next-sentence')">next</button></header>
    <div class="texts">
      <div class="source-text icelandic">{{ viewed.sentence.icelandic }}</div>
      <div class="target-texts">
        <div v-if="viewed.sentence.english" class="english">{{ viewed.sentence.english }}</div>
        <div v-if="viewed.sentence.french" class="french">{{ viewed.sentence.french }}</div>
      </div>
    </div>
    <div class="greynir-analysis">
      <div v-for="(greynir, index) in viewed.sentence.greynir" :key="`greynir-${index}`"
        :class="['greynir-word', (index == current) && 'current-greynir-word']" @mouseenter="onGreynirEnter(index)"
        @mouseleave="
          onGreynirLeave(index)">
        <span class="greynir-lemma">{{ greynir.lemma }}</span><span class="greynir-pos">{{ greynir.pos }}</span>
      </div>
    </div>
    <div class="dict">
      <div v-for="(entry, index) in dict" :key="index" ref="dictElements"
        :class="['dict-entry', (index == current) && 'current-dict-entry']" @mouseenter="onDictEnter(index)" @mouseleave="
          onDictLeave(index)">
        <button v-if="index > 0" class="dict-nav dict-prev" @click="onDictNav(-1)">{{
          viewed.sentence.greynir[index -
            1].lemma }}</button>
        <button v-if="index < dict.length - 1" class="dict-nav dict-next" @click="onDictNav(1)">{{
          viewed.sentence.greynir[index + 1].lemma }}
        </button>
        <!-- div class="dict-html" v-html="entry[1].dict"></div -->
        <custom-scrollbar class="dict-scroller" :style="{ width: '100%', height: '100%' }">
          <div class="dict-html" v-html="entry[1].dict"></div>
        </custom-scrollbar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sentence {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

header {
  margin-bottom: 1rem;
}

.texts {
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.source-text {
  max-width: 50%;
  flex: 0 0 auto;
}

.target-texts {
  flex: 1 1 0px;
}

.icelandic,
.french,
.english {
  background-size: 16px 12px;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 20px;
  padding-right: 10px;
}

.icelandic {
  background-image: url("../assets/flags/flag_IS.jpg");
}

.french {
  background-image: url("../assets/flags/flag_FR.jpg");
}

.english {
  background-image: url("../assets/flags/flag_UK.jpg");
}

.translations {}

.dict {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.dict-entry {
  border: 1px solid #999;
  flex: 0 0 100vw;
  position: relative;
  display: flex;
}

.current-dict-entry {
  background-color: #bbb;
}

.dict-nav {
  position: absolute;
  top: 50%;
  background-color: blue;
  color: white;
  font-size: 80%;
  display: none;
  z-index: 1000;
}

.current-dict-entry .dict-nav {
  display: block;
}

.dict-prev {
  left: 0;
}

.dict-next {
  right: 0;
}

.greynir-analysis {}

.greynir-word {
  display: inline-block;
  margin-right: 0.3rem;
}

.current-greynir-word {
  text-decoration: underline;
}

.greynir-lemma {}

.greynir-pos {
  font-weight: bold;
}

.greynir-lemma::after {
  content: "+";
}

.scrollbar__wrapper {
  width: 100%;
  height: 100%;
}
</style>