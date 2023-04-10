<script>
// import fs from "fs";
// import path from "path";
import { computed, ref, watch } from 'vue'
import CustomScrollbar from 'custom-vue-scrollbar';
import 'custom-vue-scrollbar/dist/style.css';

export default {
  props: {
    // total, index, sentence
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
    //
    let dictElements = ref(null);
    //
    let audioElement = ref(null);
    let sourceElement = ref(null);

    const autoplay = ref(false);

    const onToggleAutoplay = () => {
      autoplay.value = !autoplay.value;
    };

    const onListen = () => {
      if (!sourceElement.value.src || !sourceElement.value.src.startsWith("data")) {
        const dataUri = window.electronAPI.getSoundDataUri(props.viewed.sentence.audio);
        /*
        let source = document.createElement('source');
        source.src = dataUri;
        let audio = new Audio();
        audio.appendChild(source);
        audio.play();
        */
        sourceElement.value.src = dataUri;
        audioElement.value.load();
      }
      audioElement.value.play();
    };

    const onGreynirEnter = (index) => {
      // console.log(`onGreynirEnter: ${index}`)
      current.value = index;
      dictElements.value[index].scrollIntoView();
    };
    const onGreynirLeave = (index) => {
      console.log(`onGreynirLeave: ${index}`)
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
      dictElements.value[current.value].scrollIntoView();
    };

    const current = ref(-1);

    const dict = computed(() => {
      if (!props.viewed.sentence.greynir) return undefined;

      let d = new Map();
      for (let greynir of props.viewed.sentence.greynir) {
        let lemma = greynir.lemma;
        let pos = greynir.pos.replaceAll('"', "");
        let lemmaPos = `${lemma}+${pos}`;
        let html;
        let getDict = true;
        if (getDict /*lemmaPos == "hleypa+so"*/) {
          html = window.electronAPI.getDict(lemmaPos);
        } else {
          html = { dict: `(2) File not found: ${lemmaPos}.json` }
        }
        d.set(lemmaPos, html);
        // let f = path.join("C:/Dev/droopy/greynir/jimny_words", `${lemmaPos}.json`);
        // try {
        //   // console.log(`read file: ${f}`)
        //   const jsonString = fs.readFileSync(f);
        //   let html = JSON.parse(jsonString);
        //   d.set(lemmaPos, html);
        //   // console.log(`dict ${lemmaPos}: ${JSON.stringify(html)}`);
        // } catch (err) {
        //   console.error(`SentenceViewer: ${err}`);
        //   d.set(lemmaPos, { dict: `File not found: ${lemmaPos}.json` });
        // }
      }
      return [...d]; // [ [lemma+pos, dict], ..., [lemma+pos, dict] ]
    });

    watch(() => props.viewed.index, (newValue, oldValue) => {
      console.log(`props.view has been updated: ${oldValue} => ${newValue}`);
      if (sourceElement.value) {
        if (autoplay.value) {
          const dataUri = window.electronAPI.getSoundDataUri(props.viewed.sentence.audio);
          sourceElement.value.src = dataUri;
          audioElement.value.load();
          audioElement.value.play();
        } else {
          sourceElement.value.src = "";
        }
      }
    });

    return { dict, current, autoplay, onToggleAutoplay, onListen, onGreynirEnter, onGreynirLeave, onDictEnter, onDictLeave, onDictNav, dictElements, audioElement, sourceElement };
  },
};
</script>

<template>
  <div class="sentence" @mouseenter="$emit('stop-timeout')" @mouseleave="$emit('start-timeout')">
    <header>{{ 1 + viewed.index }} / {{ viewed.total }} <button @click="$emit('next-sentence')">next</button></header>
    <div :class="['texts', viewed.sentence.english || viewed.sentence.french ? 'with-target' : 'without-target']">
      <div class="source-text icelandic">
        {{ viewed.sentence.icelandic }}
        <button v-if="viewed.sentence.audio" class="audio" @click="onListen"></button>
        <span v-if="viewed.sentence.audio" class="audio-controls">
          <input type="checkbox" id="autoplay" name="autoplay" :checked="autoplay ? 'checked' : null"
            @click="onToggleAutoplay">
          <label for="autoplay">autoplay</label>
          <audio ref="audioElement" autobuffer="autobuffer">
            <source ref="sourceElement" src="" />
          </audio></span>
      </div>
      <div v-if="viewed.sentence.english || viewed.sentence.french" class="target-texts">
        <div v-if="viewed.sentence.english" class="english">{{ viewed.sentence.english }}</div>
        <div v-if="viewed.sentence.french" class="french">{{ viewed.sentence.french }}</div>
      </div>
    </div>
    <div v-if="viewed.sentence.greynir" class="greynir-analysis">
      <div v-for="(greynir, index) in viewed.sentence.greynir" :key="`greynir-${index}`"
        :class="['greynir-word', (index == current) && 'current-greynir-word']" @mouseenter="onGreynirEnter(index)"
        @mouseleave="
          onGreynirLeave(index)">
        <span class="greynir-lemma">{{ greynir.lemma }}</span><span class="greynir-pos">{{ greynir.pos }}</span>
      </div>
    </div>
    <div v-if="dict" class="dict">
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

<style lang="scss" >
.sentence {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

header {
  margin-bottom: 1rem;
  padding: 0.33rem;
}

.texts {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.33rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.texts.with-target .source-text {
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

.audio {
  width: 24px;
  height: 16px;
  background-size: cover;
  background-image: url("../assets/flags/flag_audio.jpg");
}

.french {
  background-image: url("../assets/flags/flag_FR.jpg");
}

.english {
  background-image: url("../assets/flags/flag_UK.jpg");
}

.translations {}

.greynir-analysis {
  padding: 0.33rem;
}

.dict {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.dict-entry {
  border: 1px solid #999;
  margin-left: 5px;
  margin-right: 5px;
  flex: 0 0 calc(100vw - 10px);
  position: relative;
  display: flex;
}

.current-dict-entry {
  background-color: #bbb;
}

.dict-html {
  .entry {
    // display: flex;
    margin-top: 0.5rem;
  }

  .entry.highlight {
    background-color: lightsteelblue;
    transition: background-color 0.5s;
  }

  // .entry>.entry-url {
  //   cursor: pointer;
  //   margin-right: 0.5rem;
  //   display: inline-block;
  //   width: 16px;
  //   height: 16px;
  //   flex: 0 0 auto;
  //   background-image: url("images/uwdc.png");
  //   background-position: left top;
  //   background-repeat: no-repeat;
  // }

  .entry>p.headwd {
    margin-bottom: 0.5rem;
  }

  .entry>.headwd>.graminfl>.gram {
    text-transform: capitalize;
    font-family: 'Inconsolata', monospace;
    background-color: darkred;
    color: white;
    padding: 0 4px;
    border-radius: 8px;
  }

  .entry>.headwd>.lemma {
    font-weight: 700;
  }

  .entry .sense {
    margin-bottom: 0.5rem;
  }

  .entry .sense .re {
    margin-top: 0.5rem;
  }

  .entry .hw-placeholder {
    display: none;
  }

  .entry .hw-actual {
    display: initial;
    /*font-style: italic;
            font-weight: bold;*/
    text-decoration: underline;
  }

  .orth+.sense {
    display: inline-block;
  }

  .orth+.sense:before {
    content: "\00a0\279c\00a0";
  }

  .abbr-is {
    font-style: italic;
  }
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