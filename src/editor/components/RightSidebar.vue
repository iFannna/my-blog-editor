<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../store.js'
import { getBlockType } from '../../blocks/index.js'
import { getIcon } from '../../icons/index.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
})

const store = useEditorStore()
const activeTab = ref('post')

const selectedBlock = computed(function () {
  return store.selectedBlock
})

const selectedBlockType = computed(function () {
  if (!selectedBlock.value) {
    return null
  }
  return getBlockType(selectedBlock.value.name)
})

// 文章设置
const postTitle = ref('添加标题')
const postStatus = ref('草稿')
const postVisibility = ref('公开')
const postPublishDate = ref('立即发布')
const postAuthor = ref('admin')
const postPermalink = ref('标准')
const featuredImage = ref('')

// 分类和标签
const categoriesOpen = ref(false)
const tagsOpen = ref(false)

function setActiveTab(tab) {
  activeTab.value = tab
}

function handleFeaturedImageClick() {
  const url = prompt('请输入封面图片地址:')
  if (url) {
    featuredImage.value = url
  }
}

function removeFeaturedImage() {
  featuredImage.value = ''
}

function toggleCategories() {
  categoriesOpen.value = !categoriesOpen.value
}

function toggleTags() {
  tagsOpen.value = !tagsOpen.value
}

function updateBlockAttribute(key, value) {
  if (selectedBlock.value) {
    const attrs = {}
    attrs[key] = value
    store.updateBlockAttributes(selectedBlock.value.clientId, attrs)
  }
}
</script>

<template>
  <aside class="editor-right-sidebar" :class="{ 'is-hidden': !visible }">
    <!-- 标签页 -->
    <div class="sidebar-tabs">
      <button
        type="button"
        class="sidebar-tab"
        :class="{ 'is-active': activeTab === 'post' }"
        @click="setActiveTab('post')"
      >
        文章
      </button>
      <button
        type="button"
        class="sidebar-tab"
        :class="{ 'is-active': activeTab === 'block' }"
        @click="setActiveTab('block')"
      >
        区块
      </button>
    </div>

    <!-- 文章设置面板 -->
    <div v-if="activeTab === 'post'" class="sidebar-panel">
      <!-- 特色图片 -->
      <div class="panel-section">
        <h3 class="panel-section-title">设置封面图片</h3>

        <div v-if="featuredImage" class="featured-image-preview">
          <img :src="featuredImage" alt="封面图片" />
          <button type="button" class="remove-image-btn" @click="removeFeaturedImage">
            移除图片
          </button>
        </div>

        <div v-else class="featured-image-placeholder" @click="handleFeaturedImageClick">
          设置封面图片
        </div>
      </div>

      <!-- 摘要 -->
      <div class="panel-section">
        <h3 class="panel-section-title">添加摘要…</h3>
      </div>

      <!-- 状态和可见性 -->
      <div class="panel-section">
        <div class="panel-row">
          <span class="panel-label">状态</span>
          <span class="panel-value">{{ postStatus }}</span>
        </div>
        <div class="panel-row">
          <span class="panel-label">可见性</span>
          <span class="panel-value">{{ postVisibility }}</span>
        </div>
        <div class="panel-row">
          <span class="panel-label">发布时间</span>
          <span class="panel-value">{{ postPublishDate }}</span>
        </div>
        <div class="panel-row">
          <span class="panel-label">作者</span>
          <span class="panel-value">{{ postAuthor }}</span>
        </div>
        <div class="panel-row">
          <span class="panel-label">评论</span>
          <span class="panel-value">开放</span>
        </div>
        <div class="panel-row">
          <span class="panel-label">格式</span>
          <span class="panel-value">{{ postPermalink }}</span>
        </div>
      </div>

      <!-- 分类目录 -->
      <div class="panel-section">
        <h3 class="panel-section-title" @click="toggleCategories">
          <span>分类目录</span>
          <span
            class="panel-toggle"
            v-html="getIcon(categoriesOpen ? 'chevronDown' : 'chevronRight')"
          ></span>
        </h3>
        <div v-if="categoriesOpen" class="panel-section-content">
          <label class="checkbox-item"> <input type="checkbox" /> 未分类 </label>
        </div>
      </div>

      <!-- 标签 -->
      <div class="panel-section">
        <h3 class="panel-section-title" @click="toggleTags">
          <span>标签</span>
          <span
            class="panel-toggle"
            v-html="getIcon(tagsOpen ? 'chevronDown' : 'chevronRight')"
          ></span>
        </h3>
        <div v-if="tagsOpen" class="panel-section-content">
          <input type="text" class="panel-input" placeholder="添加新标签" />
        </div>
      </div>
    </div>

    <!-- 区块设置面板 -->
    <div v-if="activeTab === 'block'" class="sidebar-panel">
      <template v-if="selectedBlock && selectedBlockType">
        <div class="panel-section">
          <h3 class="panel-section-title">{{ selectedBlockType.title }} 设置</h3>

          <!-- 段落块设置 -->
          <template v-if="selectedBlock.name === 'core/paragraph'">
            <div class="panel-row">
              <span class="panel-label">字体大小</span>
              <select
                class="panel-select"
                @change="updateBlockAttribute('fontSize', $event.target.value)"
              >
                <option value="">默认</option>
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
                <option value="x-large">特大</option>
              </select>
            </div>
          </template>

          <!-- 标题块设置 -->
          <template v-if="selectedBlock.name === 'core/heading'">
            <div class="panel-row">
              <span class="panel-label">级别</span>
              <select
                class="panel-select"
                :value="selectedBlock.attributes.level"
                @change="updateBlockAttribute('level', Number($event.target.value))"
              >
                <option value="1">H1</option>
                <option value="2">H2</option>
                <option value="3">H3</option>
                <option value="4">H4</option>
                <option value="5">H5</option>
                <option value="6">H6</option>
              </select>
            </div>
          </template>

          <!-- 图片块设置 -->
          <template v-if="selectedBlock.name === 'core/image'">
            <div class="panel-field">
              <label class="panel-label">替代文本</label>
              <input
                type="text"
                class="panel-input"
                :value="selectedBlock.attributes.alt"
                @input="updateBlockAttribute('alt', $event.target.value)"
                placeholder="描述图片用途"
              />
            </div>
            <div class="panel-field">
              <label class="panel-label">图片地址</label>
              <input
                type="text"
                class="panel-input"
                :value="selectedBlock.attributes.url"
                @input="updateBlockAttribute('url', $event.target.value)"
                placeholder="输入图片URL"
              />
            </div>
          </template>

          <!-- 代码块设置 -->
          <template v-if="selectedBlock.name === 'core/code'">
            <div class="panel-field">
              <label class="panel-label">语言</label>
              <select
                class="panel-select"
                @change="updateBlockAttribute('language', $event.target.value)"
              >
                <option value="">自动</option>
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
              </select>
            </div>
          </template>
        </div>

        <!-- 高级设置 -->
        <div class="panel-section">
          <h3 class="panel-section-title">高级</h3>
          <div class="panel-field">
            <label class="panel-label">HTML 锚点</label>
            <input type="text" class="panel-input" placeholder="添加一个锚点" />
          </div>
          <div class="panel-field">
            <label class="panel-label">额外 CSS 类</label>
            <input type="text" class="panel-input" placeholder="用空格分隔多个类" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="panel-empty">
          <p>选择一个区块以显示其设置。</p>
        </div>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.featured-image-preview {
  margin-bottom: 15px;
}

.featured-image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 8px;
}

.remove-image-btn {
  width: 100%;
  padding: 8px;
  border: 1px solid #cc1818;
  border-radius: 4px;
  background: none;
  color: #cc1818;
  font-size: 13px;
  cursor: pointer;
}

.remove-image-btn:hover {
  background: #fee;
}

.panel-field {
  margin-bottom: 15px;
}

.panel-field .panel-label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #757575;
}

.panel-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.panel-select:focus {
  outline: none;
  border-color: #007cba;
}

.panel-toggle {
  display: flex;
  align-items: center;
}

.panel-toggle svg {
  width: 24px;
  height: 24px;
}

.panel-section-content {
  padding-top: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.checkbox-item input {
  width: 16px;
  height: 16px;
}

.panel-empty {
  text-align: center;
  padding: 40px 20px;
  color: #757575;
}

.panel-empty p {
  margin: 0;
  font-size: 13px;
}
</style>
