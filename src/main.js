import { createApp } from 'vue'
import App from './App.vue'

// import 'bootstrap/dist/css/bootstrap.min.css'
import '@/scss/global.scss'

const app = createApp(App);
// console.log(`app.config: ${JSON.stringify(app.config)}`);
// app.config.compilerOptions.whitespace = 'preserve';
// runtime-core.esm-bundler.js:40 [Vue warn]: The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.
// - For vue-loader: pass it via vue-loader's `compilerOptions` loader option.
// - For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
// - For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-dom
app.mount('#app');