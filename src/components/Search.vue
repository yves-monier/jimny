<script>
import { reactive, watch } from 'vue'

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
                    store.searched = store.input;
                    if (!store.searched || store.searched.length < 3) {
                        // not enough to search
                        store.results = [];
                    } else {
                        // search store.searched
                        let res = props.sentences.filter(s => s.icelandic.includes(store.searched));
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

        return { store/*, results*/ };
    },
};
</script>

<template>
    <div class="form-group mt-4 mb-2 search">
        <div class="search-input">
            <input type="text" id="leita" name="leita" :placeholder="`Leita (${sentences.length})`" v-model="store.input" />
            <!-- div v-if="search.result && search.result.length > 0" class="icon-close" @click="onCloseSearch"></div -->
        </div>
        <div v-if="store.results && store.results.length > 0" class="search-result">
            <!-- div class="icon-close" @click="onCloseSearch"></div -->
            <ul>
                <li v-for="(sentence, index) in store.results" :key="`search-${index}`"
                    @click="$emit('select-sentence', sentence)">
                    {{ sentence.icelandic }}
                    <!-- span class="search-src" v-html="highlightSearch(word.src)"></span><span class="search-target"
                                                                        v-html="highlightSearch(word.target)">
                                                                    </span -->
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>