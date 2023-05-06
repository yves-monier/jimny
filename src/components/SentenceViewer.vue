<script>
// import fs from "fs";
// import path from "path";
import { computed, ref, watch } from 'vue'
import CustomScrollbar from 'custom-vue-scrollbar';
import 'custom-vue-scrollbar/dist/style.css';
import { load } from "cheerio";

let abbreviations = [
  // { "abbr": "acc", "is": "?olfall", "en": "accusative" },
  // { "abbr": "adj", "is": "l?singaror?", "en": "adjective" },
  // { "abbr": "adj comp", "is": "l?singaror? ? mi?stigi", "en": "comparative adjective" },
  // { "abbr": "adj (dat)", "is": "l?singaror? sem tekur me? s?r ??gufall", "en": "adjective that governs the dative case" },
  // { "abbr": "adj indecl", "is": "?beygjanlegt l?singaror?", "en": "indeclinable adjective" },
  // { "abbr": "adj n", "is": "l?singaror? ? hvorugkyni", "en": "neuter adjective" },
  // { "abbr": "adj pl", "is": "l?singaror? ? fleirt?lu", "en": "plural adjective" },
  // { "abbr": "adj superl", "is": "l?singaror? ? efstastigi", "en": "superlative adjective" },
  // { "abbr": "adv", "is": "atviksor?", "en": "adverb" },
  // { "abbr": "adv comp", "is": "atviksor? ? mi?stigi", "en": "comparative adverb" },
  // { "abbr": "adv superl", "is": "atviksor? ? efstastigi", "en": "superlative adverb" },
  // { "abbr": "comp", "is": "mi?stig", "en": "comparative" },
  // { "abbr": "conj", "is": "samtenging", "en": "conjunction" },
  // { "abbr": "dat", "is": "??gufall", "en": "dative" },
  // { "abbr": "dat+acc", "is": "er merki vi? s?gn sem tekur me? s?r andlag ? ??gufalli og ?olfalli", "en": "indicates a verb with dative + accusative objects" },
  { "abbr": "e-a", "is": "einhverja", "en": "somebody (feminine)" },
  // { "abbr": "e-�", "is": "eitthva�", "en": "something" },
  { "abbr": "e-\u00f0", "is": "eitthva\u00f0", "en": "something" },
  { "abbr": "e-n", "is": "einhvern", "en": "somebody (masculine)" },
  { "abbr": "e-m", "is": "einhverjum", "en": "somebody" },
  { "abbr": "e-s", "is": "einhvers", "en": "somebody's" },
  { "abbr": "e-u", "is": "einhverju", "en": "something" },
  // { "abbr": "esp", "is": "einkum", "en": "especially" },
  // { "abbr": "f", "is": "kvenkyn/nafnor? ? kvenkyni", "en": "feminine/feminine noun" },
  // { "abbr": "f indecl", "is": "?beygjanlegt nafnor? ? kvenkyni", "en": "indeclinable feminine noun" },
  // { "abbr": "f pl", "is": "fleirt?lunafnor? ? kvenkyni", "en": "feminine plural noun" },
  // { "abbr": "gen", "is": "eignarfall", "en": "genitive" },
  // { "abbr": "impers", "is": "?pers?nuleg notkun", "en": "impersonal usage" },
  // { "abbr": "indic", "is": "frams?guh?ttur", "en": "indicative" },
  // { "abbr": "interj", "is": "upphr?pun", "en": "interjection" },
  // { "abbr": "m", "is": "karlkyn/nafnor? ? karlkyni", "en": "masculine/masculine noun" },
  // { "abbr": "m?lfr", "is": "m?lfr??i", "en": "grammar" },
  // { "abbr": "m pl", "is": "fleirt?lunafnor? ? karlkyni", "en": "masculine plural noun" },
  // { "abbr": "n", "is": "hvorugkyn/nafnor? ? hvorugkyni", "en": "neuter/neuter noun" },
  // { "abbr": "n indecl", "is": "?beygjanlegt nafnor?", "en": "indeclinable neuter noun" },
  // { "abbr": "n pl", "is": "fleirt?lunafnor? ? hvorugkyni", "en": "neuter plural noun" },
  // { "abbr": "num", "is": "t?luor?", "en": "numeral" },
  // { "abbr": "ofl", "is": "og fleira", "en": "and others" },
  // { "abbr": "pers", "is": "pers?na", "en": "person" },
  // { "abbr": "pl", "is": "fleirtala", "en": "plural" },
  // { "abbr": "poet", "is": "sk?ldskaparm?l", "en": "poetical/archaic" },
  // { "abbr": "pp", "is": "l?singarh?ttur ??t??ar", "en": "past participle" },
  // { "abbr": "prep", "is": "forsetning", "en": "preposition" },
  // { "abbr": "prep (acc)", "is": "forsetning sem st?rir ?olfalli", "en": "preposition that governs the accusative case" },
  // { "abbr": "prep (dat)", "is": "forsetning sem st?rir ??gufalli", "en": "preposition that governs the dative case" },
  // { "abbr": "prep (gen)", "is": "forsetning sem st?rir eignarfalli", "en": "preposition that governs the genitive case" },
  // { "abbr": "pron", "is": "fornafn", "en": "pronoun" },
  // { "abbr": "pron demon", "is": "?bendingarfornafn", "en": "demonstrative pronoun" },
  // { "abbr": "pron indef", "is": "??kve?i? fornafn", "en": "indefinite pronoun" },
  // { "abbr": "pron pl", "is": "fornafn ? fleirt?lu", "en": "pronoun plural" },
  // { "abbr": "pron poss", "is": "eignarfornafn", "en": "possessive pronoun" },
  // { "abbr": "pron refl", "is": "afturbeygt fornafn", "en": "reflexive pronoun" },
  // { "abbr": "prp", "is": "l?singarh?ttur n?t??ar", "en": "present participle" },
  // { "abbr": "refl", "is": "mi?mynd", "en": "reflexive, middle voice" },
  // { "abbr": "rel", "is": "tilv?sunaror?", "en": "relative" },
  // { "abbr": "sby", "is": "einhver", "en": "somebody" },
  // { "abbr": "sby's", "is": "einhvers/einhverrar", "en": "somebody's" },
  // { "abbr": "sg", "is": "eintala", "en": "singular" },
  // { "abbr": "skammst", "is": "skammst?fun", "en": "abbreviation" },
  // { "abbr": "sth", "is": "eitthva?", "en": "something" },
  // { "abbr": "st?r?fr", "is": "st?r?fr??i", "en": "mathematics" },
  // { "abbr": "UK", "is": "bresk stafsetning e?a m?lnotkun", "en": "British spelling or usage" },
  // { "abbr": "US", "is": "nor?uramer?sk stafsetning e?a m?lnotkun", "en": "N. American spelling or usage" },
  // { "abbr": "v aux", "is": "hj?lpars?gn", "en": "auxiliary verb" },
  // { "abbr": "v impers", "is": "?pers?nuleg s?gn", "en": "impersonal verb" },
  // { "abbr": "v refl", "is": "mi?myndars?gn", "en": "reflexive verb" }
];

let initAbbr = false;

// Credits https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegexp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function desabbreviate(html) {
  if (!initAbbr) {
    for (let i = 0; i < abbreviations.length; i++) {
      let a = abbreviations[i];
      let regex = new RegExp('(^| )(' + escapeRegexp(a.abbr) + ')( |$)', 'g');
      a.rx = regex;
    }
    initAbbr = true;
  }

  for (let i = 0; i < abbreviations.length; i++) {
    let a = abbreviations[i];
    // html = html.replace(a.rx, a.is);
    html = html.replace(a.rx, "$1<span class='abbr-is' title='" + a.is + " (" + a.en + ")'>$2</span>$3");
  }
  return html;
}

// List of HTML entities for escaping.
let htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

// Regex containing the keys listed immediately above.
let htmlEscaper = /[&<>"'/]/g;

// Escape a string for HTML interpolation.
function htmlEscape(string) {
  return ('' + string).replace(htmlEscaper, function (match) {
    return htmlEscapes[match];
  });
}

// eslint-disable-next-line no-unused-vars
function enrichIcelandic(html) {
  let $dictLookupHtml = load(html);
  $dictLookupHtml(".entry").each(function (i, objEntry) {
    let $entry = $dictLookupHtml(objEntry);

    let headwdObj = $dictLookupHtml(".headwd > .lemma", $entry);
    let headwd = "???";
    if (headwdObj.length > 0) {
      headwd = headwdObj[0].children.filter(function (node) {
        return node.nodeType == 3;
      })[0].nodeValue;
    }

    let hwFull = headwd;

    // search for '/' or '.' headword separator (see https://digicoll.library.wisc.edu/cgi-bin/IcelOnline/IcelOnline.TEId-idx?type=HTML&rgn=DIV1&id=IcelOnline.IEOrd&target=IcelOnline.IEOrd.Guide)
    let separatorPos = hwFull.indexOf('/');
    if (separatorPos == -1) {
      separatorPos = hwFull.indexOf('.');
    }
    if (separatorPos != -1) {
      let regex = new RegExp('\\/|\\.', 'g');
      hwFull = hwFull.replace(regex, ''); // e.g. "tal/a" => "tala"
    }

    let regexFull = /(~~)/g;
    let enrichmentFull = "<span class='hw-placeholder'>$1</span><span class='hw-actual'>" + htmlEscape(hwFull) + "</span>";
    let regexBeforeSeparator = /(~)/g;
    let hwBeforeSeparator = headwd;
    if (separatorPos != -1) {
      hwBeforeSeparator = hwBeforeSeparator.substring(0, separatorPos);
    }
    let enrichmentBeforeSeparator = "<span class='hw-placeholder'>$1</span><span class='hw-actual'>" + htmlEscape(hwBeforeSeparator) + "</span>";

    $dictLookupHtml(".orth, .usg"/*, entryElement*/, $entry).each(function (i, objOrth) {
      let $obj = $dictLookupHtml(objOrth);
      let html = $obj.html();
      let enrichedHtml = html.replace(regexFull, enrichmentFull); // tala, segja, sj?n, ...
      enrichedHtml = enrichedHtml.replace(regexBeforeSeparator, enrichmentBeforeSeparator); // tala, segja, sj?n
      enrichedHtml = desabbreviate(enrichedHtml);
      if (html !== enrichedHtml) {
        $obj.html(enrichedHtml);
      }
    });
  });
  let enrichedHtml = $dictLookupHtml("body").html();
  return enrichedHtml;
}

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
      dictElements.value[current.value].scrollIntoView();
    };

    const current = ref(-1);

    const dict = computed(() => {
      if (!props.viewed.sentence.greynir) return undefined;

      let d = [];
      for (let greynir of props.viewed.sentence.greynir) {
        let lemma = greynir.lemma;
        let pos = greynir.pos.replaceAll('"', "");
        let lemmaPos = `${lemma}+${pos}`;
        let html;
        let getDict = true;
        if (getDict /*lemmaPos == "hleypa+so"*/) {
          html = window.electronAPI.getDict(lemmaPos);
          let enrichedDict = enrichIcelandic(html.dict);
          html.dict = enrichedDict;
          console.log(`enrichedHtml: ${enrichedDict}`)
        } else {
          html = { dict: `(2) File not found: ${lemmaPos}.json` }
        }
        d.push([lemmaPos, html]);
      }
      // return [...d]; // [ [lemma+pos, dict], ..., [lemma+pos, dict] ]
      return d; // [ [lemma+pos, dict], ..., [lemma+pos, dict] ]
    });

    watch(() => props.viewed.index, (/*newValue, oldValue*/) => {
      // console.log(`props.view has been updated: ${oldValue} => ${newValue}`);
      if (props.viewed.autoplay) {
        if (props.viewed.sentence.audio) {
          if (sourceElement.value) {
            const dataUri = window.electronAPI.getSoundDataUri(props.viewed.sentence.audio);
            sourceElement.value.src = dataUri;
            audioElement.value.load();
            audioElement.value.play();
          } else {
            console.log("Problem!");
          }
        }
      } /*else {
        if (sourceElement.value) {
          sourceElement.value.src = "";
        }
      } */
    });

    return { dict, current, onListen, onGreynirEnter, onGreynirLeave, onDictEnter, onDictLeave, onDictNav, dictElements, audioElement, sourceElement };
  },
};
</script>

<template>
  <div :class="['sentence', viewed.large ? 'sentence-large' : 'sentence-small']" @mouseenter="$emit('stop-timeout')"
    @mouseleave="$emit('start-timeout')">
    <div :class="['texts', viewed.sentence.english || viewed.sentence.french ? 'with-target' : 'without-target']">
      <div class="source-text icelandic" :title="`sentence no. ${viewed.sentence.id}`">
        {{ viewed.sentence.icelandic }}
        <button v-if="viewed.sentence.audio" class="audio" @click="onListen"></button>
        <span class="audio-controls">
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
        @mouseleave="onGreynirLeave(index)">
        <span class="greynir-lemma">{{ greynir.lemma }}</span><span class="greynir-pos">{{ greynir.pos }}</span>
      </div>
    </div>
    <div v-if="dict" class="dict">
      <div v-for="(entry, index) in dict" :key="index" ref="dictElements"
        :class="['dict-entry', (index == current) && 'current-dict-entry']" @mouseenter="onDictEnter(index)"
        @mouseleave="onDictLeave(index)">
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

<style lang="scss" scoped>
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

.sentence-small .dict {
  display: none;
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
  background-color: #eee;
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
  border-bottom: 2px solid transparent;
}

.current-greynir-word {
  // text-decoration: underline;
  border-bottom: 2px solid #999;
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