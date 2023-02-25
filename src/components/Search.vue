<script>
import { ref, computed } from 'vue'

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
        const input = ref("");
        const results = computed(
            () => {
                if (!input.value || input.value.length < 3) return null;
                let res = props.sentences.filter(s => s.icelandic.includes(input.value));
                return res;
            }
        );
        return { input, results };
    },
};
</script>

<template>
    <div class="form-group mt-4 mb-2 search">
        <div class="search-input">
            <input type="text" id="leita" name="leita" :placeholder="`Leita (${sentences.length})`" v-model="input" />
            <!-- div v-if="search.result && search.result.length > 0" class="icon-close" @click="onCloseSearch"></div -->
        </div>
        <div v-if="results && results.length > 0" class="search-result">
            <!-- div class="icon-close" @click="onCloseSearch"></div -->
            <ul>
                <li v-for="(sentence, index) in results" :key="`search-${index}`"
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