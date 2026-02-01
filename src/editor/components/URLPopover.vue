<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  placeholder: { type: String, default: '粘贴或输入 URL' },
  anchorEl: { type: Object, default: null },
})

const emit = defineEmits(['update:visible', 'submit', 'close'])

const inputRef = ref(null)
const popoverRef = ref(null)
const inputValue = ref('')
const style = ref({})

watch(
  function () {
    return props.visible
  },
  function (visible) {
    if (visible) {
      inputValue.value = ''
      nextTick(function () {
        updatePosition()
        if (inputRef.value) {
          inputRef.value.focus()
        }
      })
    }
  },
)

function updatePosition() {
  if (!props.anchorEl) return

  var rect = props.anchorEl.getBoundingClientRect()
  style.value = {
    position: 'fixed',
    top: rect.bottom + 8 + 'px',
    left: rect.left + 'px',
    zIndex: 100001,
  }
}

function handleSubmit(e) {
  e.preventDefault()
  var url = inputValue.value.trim()
  if (url) {
    if (!/^https?:\/\//i.test(url) && !/^\//.test(url) && !/^data:/i.test(url)) {
      url = 'https://' + url
    }
    emit('submit', url)
  }
  close()
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    close()
  }
}

function close() {
  emit('update:visible', false)
  emit('close')
}

function handleClickOutside(e) {
  if (!props.visible) return
  if (!popoverRef.value) return
  if (popoverRef.value.contains(e.target)) return
  if (props.anchorEl && props.anchorEl.contains(e.target)) return
  close()
}

onMounted(function () {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(function () {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="popoverRef"
      class="block-editor-url-popover"
      :style="style"
      @keydown="handleKeyDown"
    >
      <form class="block-editor-url-popover__form" @submit="handleSubmit">
        <svg class="block-editor-url-popover__icon" viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"
            fill="currentColor"
          />
        </svg>
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          class="block-editor-url-popover__input"
          :placeholder="placeholder"
        />
        <button type="submit" class="block-editor-url-popover__submit" title="应用">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M16.4 7L18 8.6l-9.5 9.5-4.5-4.5L5.6 12l2.9 2.9 7.9-7.9z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </div>
  </Teleport>
</template>

<style>
.block-editor-url-popover {
  background: #fff;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.block-editor-url-popover__form {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
  margin: 0;
}

.block-editor-url-popover__icon {
  flex-shrink: 0;
  color: #757575;
}

.block-editor-url-popover__input {
  flex: 1;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #949494;
  border-radius: 2px;
  font-size: 13px;
  color: #1e1e1e;
  background: #fff;
  margin: 0;
}

.block-editor-url-popover__input:focus {
  outline: none;
  border-color: #3858e9;
  box-shadow: 0 0 0 1px #3858e9;
}

.block-editor-url-popover__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: none;
  color: #1e1e1e;
  cursor: pointer;
  flex-shrink: 0;
}

.block-editor-url-popover__submit:hover {
  background: #f0f0f0;
}
</style>
