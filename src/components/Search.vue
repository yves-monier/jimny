<template>
    <!-- div class="form-group mt-4 mb-2 search" -->
    <div class="search">
        <input ref="inputElement" type="text" id="leita" name="leita" :placeholder="`Leita (${sentences.length})`"
            v-model="store.input" />
        <!-- div v-if="store.results && store.results.length > 0" class="search-result-overlay" @click="onClose($event)" -->
        <div v-if="store.results && store.results.length > 0" class="search-result">
            <div class="search-close" @click="onClose"></div>
            <custom-scrollbar class="search-result-scroller" :style="{ width: '100%', height: '100%' }">
                <ul class="search-result-list">
                    <li v-for="(sentence, index) in store.results" :key="`search-${index}`"
                        @click="$emit('select-sentence', sentence)">
                        {{ sentence.icelandic }}
                        <!-- span class="search-src" v-html="highlightSearch(word.src)"></span><span class="search-target"
                                                                                    v-html="highlightSearch(word.target)">
                                                                                </span -->
                    </li>
                </ul>
            </custom-scrollbar>
        </div>
        <!-- /div -->
    </div>
</template>
<script>
import { reactive, ref, watch } from 'vue'
import CustomScrollbar from 'custom-vue-scrollbar';
import 'custom-vue-scrollbar/dist/style.css';

export default {
    props: {
        sentences: { type: Array, default: () => [] },
    },
    components: { CustomScrollbar },
    // setup(_, { emit }) {
    //   const onFileClick = (file) => {
    //     if (file.directory) emit("folderclick", file);
    //   };
    //   return { onFileClick };
    // },
    setup(props/*, context*/) {
        const inputElement = ref(null);

        const store = reactive({ input: "", searched: "", results: [] });

        let searchTimeout;
        watch(
            () => store.input,
            (current, prev) => {
                console.log(`prev: ${prev}, current: ${current}`)
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                    searchTimeout = null;
                }
                searchTimeout = setTimeout(() => {
                    // inputElement.value.blur();
                    store.searched = store.input;
                    if (!store.searched || store.searched.length < 3) {
                        // not enough to search
                        store.results = [];
                    } else {
                        // search store.searched
                        let res = props.sentences.filter(s => s.icelandic.includes(store.searched) || (s.english && s.english.includes(store.searched)) || (s.french && s.french.includes(store.searched)));
                        store.results = res;
                    }
                }, 500);
            }
        );

        // const results = computed(
        //     () => {
        //         if (!store.input || store.input.length < 3) return null;
        //         let res = props.sentences.filter(s => s.icelandic.includes(store.input));
        //         return res;
        //     }
        // );

        const onClose = (/*ev*/) => {
            // if (ev.target.classList.contains("dialog-overlay")) {
            //     context.emit('close');
            // }
            store.results = null;
        };

        return { store, onClose, inputElement /*, results*/ };
    },
};
</script>

<style lang="scss" scoped>
.search {
    padding-left: 6px;
    padding-right: 6px;

    input {
        border: none;

        &:focus {
            outline: 0;
        }
    }
}

.search-result-overlay {
    width: 100%;
    height: 100%;
    background-color: rgba(200, 200, 200, 0.7);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}

.search-close {
    position: absolute;
    top: 10px;
    right: 30px;
    z-index: 10000;

    &::after {
        position: absolute;
        content: "";
        width: 20px;
        height: 20px;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
        background-image: url(../assets/close.svg);
    }
}

.search-result {
    width: 80%;
    max-width: 40rem;
    height: 80%;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #999;
    border-radius: 10px;
    background-color: rgba(240, 240, 240, 0.9);
    z-index: 2000;
}

.search-result-list {
    list-style: none;
    padding-left: 1rem;

    li {
        cursor: default;
    }
}

.scrollbar__wrapper {
    width: 100%;
    height: 100%;
}
</style>