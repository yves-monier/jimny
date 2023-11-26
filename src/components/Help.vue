<script>

export default {
  props: {
  },
  components: {},
  setup(props, context) {
    const onClickOutside = (ev) => {
      if (ev.target.classList.contains("dialog-overlay")) {
        context.emit('close');
      }
    };
    return { onClickOutside };
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
        <p>Jimny's <a target="_blank" href="https://github.com/yves-monier/jimny">github repository</a></p>
        <h2>Credits</h2>
        <p><a target="_blank" href="https://bin.arnastofnun.is">Beygingarlýsing íslensks nútímamáls</a> by <a target="_blank" href="https://arnastofnun.is/is">Stofnun Árna Magnússonar</a></p>
        <p><a target="_blank" href="https://digicoll.library.wisc.edu/IcelOnline/Search.TEId.html">Icelandic Online Dictionary</a> by <a target="_blank" href="https://www.wisc.edu">University of Wisconsin–Madison</a></p>
        <p><a target="_blank" href="https://github.com/mideind/GreynirPackage">Greynir package</a> by <a target="_blank" href="https://mideind.is">Miðeind ehf.</a></p>
        <p><a target="_blank" href="https://samromur.is/gagnasafn">Gagnasafnið setninga</a> by <a target="_blank" href="https://samromur.is">Samrómur</a></p>
      </div>
      <footer>
        <button class="dialog-cancel" @click="$emit('close')">Close</button>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" >
.dialog-overlay {
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.7);
  position: fixed;
  z-index: 100;
}

.dialog {
  width: 80%;
  max-width: 40rem;
  // height: 60%;
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