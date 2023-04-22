<script>
import { reactive, ref } from "vue";

export default {
  props: {
    settings: {
      type: Object, default: () => { return {} },
    }
  },
  components: {},
  setup(props, context) {
    const dialogSettings = reactive({ ...props.settings });

    let sentencesFileElement = ref(null);

    let labels = reactive({ fr: { "select-file": "Choisir un fichier", "select-folder": "Choisir un répertoire" }, default: { "select-file": "Select file", "select-folder": "Select folder" } });

    let lang = "default";
    const navigatorLanguage = navigator.language;
    if (navigatorLanguage.startsWith("fr")) {
      lang = "fr";
    }
    const language = ref(lang);

    const onClickOutside = (ev) => {
      if (ev.target.classList.contains("dialog-overlay")) {
        context.emit('close');
      }
    };

    const onFileChanged = (ev, name) => {
      console.log(`file ${name}: ${JSON.stringify(ev.target.files)}`);
      if (ev.target.files.length > 0) {
        dialogSettings[name] = ev.target.files[0].path;
      }
    };

    const onChangeFolder = (ev, name) => {
      window.electronAPI.selectFolder().then((folder) => {
        if (folder) {
          console.log(`folder ${name}: ${folder}`);
          dialogSettings[name] = folder;
        } else {
          console.log(`folder ${name}: none`);
        }
      });
    };

    return { dialogSettings, language, labels, sentencesFileElement, onClickOutside, onFileChanged, onChangeFolder };
  },
};
</script>

<template>
  <div class="dialog-overlay" @click="onClickOutside($event)">
    <div class="dialog dialog-settings">
      <header>
        <div class="dialog-close" @click="$emit('close')"></div>
      </header>
      <div class="dialog-body">
        <p>
          <label>Sentences file: {{ dialogSettings.sentencesFile }}</label>
          <input style="display: none;" ref="sentencesFileElement" type="file"
            @change="onFileChanged($event, 'sentencesFile')" />
          <button @click="sentencesFileElement.click()">{{ labels[language]["select-file"] }}</button>
        </p>
        <p>
          <label>Words folder: {{ dialogSettings.wordsFolder }}</label>
          <button @click="onChangeFolder($event, 'wordsFolder')">{{ labels[language]["select-folder"] }}</button>
        </p>
        <p>
          <label>Audio folder: {{ dialogSettings.audioFolder }}</label>
          <button @click="onChangeFolder($event, 'audioFolder')">{{ labels[language]["select-folder"] }}</button>
        </p>
        <p>
          <input type="checkbox" id="autoplay" name="autoplay" v-model="dialogSettings.autoplay">
          <label for="autoplay">Play audio automatically</label>
        </p>
        <p>
          <input type="checkbox" id="autobrowse" name="autobrowse" v-model="dialogSettings.autobrowse" />
          <label for="autobrowse">Browse sentences automatically</label>
          <input type="number" min="1" max="60" v-model="dialogSettings.autobrowseDuration"
            :disabled="dialogSettings.autobrowse ? null : 'disabled'">
        </p>
      </div>
      <footer>
        <button class="dialog-cancel" @click="$emit('close')">Cancel</button>
        <button class="dialog-ok" @click="$emit('close', dialogSettings)">OK</button>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" >
.dialog-overlay {
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.7);
  position: absolute;
}

.dialog {
  width: 80%;
  max-width: 40rem;
  height: 80%;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #999;
  border-radius: 10px;
  background-color: white;
}

.dialog-close {
  position: absolute;
  top: 10px;
  right: 30px;

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

.dialog-body {
  padding: 20px;
}

.dialog footer {
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 10px;

  button {
    margin-left: 10px;
  }
}
</style>