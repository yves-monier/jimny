<script>
import { reactive } from "vue";

export default {
  props: {
    settings: {
      type: Object, default: () => { },
    }
  },
  components: {},
  setup(props, context) {
    const dialogSettings = reactive({ ...props.settings });
    const onClickOutside = (ev) => {
      if (ev.target.classList.contains("dialog-overlay")) {
        context.emit('close');
      }
    };
    return { dialogSettings, onClickOutside };
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
          <label>Sentences file</label>
          <input type="file" />
        </p>
        <p><label>Audio directory</label>
          <input type="file" />
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