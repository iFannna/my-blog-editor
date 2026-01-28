<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import hljs from 'highlight.js/lib/core'

// 按需导入语言
import java from 'highlight.js/lib/languages/java'
import python from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import csharp from 'highlight.js/lib/languages/csharp'
import cpp from 'highlight.js/lib/languages/cpp'
import go from 'highlight.js/lib/languages/go'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'

// 注册语言
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('c', c)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)

// 语言特征检测规则
const languagePatterns = {
  python: {
    patterns: [
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /\bdef\s+\w+\s*\(/,
      /\bclass\s+\w+.*:/,
      /\bself\./,
      /\bself,/,
      /:\s*$/m,
      /\belif\b/,
      /\bprint\s*\(/,
      /\bTrue\b|\bFalse\b|\bNone\b/,
      /\blambda\s+\w+:/,
      /\bexcept\s+\w+:/,
      /__\w+__/,
      /\brange\s*\(/,
      /\blen\s*\(/,
      /\bin\s+range\(/,
      /^\s*#(?!include|define|pragma)/m,
    ],
    weight: 1,
  },
  java: {
    patterns: [
      /\bpublic\s+class\s+\w+/,
      /\bprivate\s+\w+\s+\w+\s*[;=]/,
      /\bprotected\s+\w+/,
      /\bSystem\.out\.print/,
      /\bpublic\s+static\s+void\s+main/,
      /\bnew\s+\w+\s*\(/,
      /\bimport\s+java\./,
      /\bextends\s+\w+/,
      /\bimplements\s+\w+/,
      /\b@Override\b/,
      /\b@Autowired\b/,
      /\bpackage\s+[\w.]+;/,
      /\bthrows\s+\w+/,
      /\.class\b/,
      /\binstanceof\b/,
    ],
    weight: 1,
  },
  csharp: {
    patterns: [
      /\busing\s+System/,
      /\bnamespace\s+\w+/,
      /\bpublic\s+class\s+\w+/,
      /\bConsole\.Write/,
      /\bvar\s+\w+\s*=/,
      /\bstring\[\]/,
      /\basync\s+Task/,
      /\bawait\s+\w+/,
      /\bget\s*{\s*return/,
      /\bset\s*{/,
      /\bpartial\s+class/,
      /\busing\s*\(/,
      /\b\[.*\]\s*$/m,
      /=>\s*{/,
      /\bIEnumerable</,
      /\bList</,
      /\bDictionary</,
    ],
    weight: 1,
  },
  cpp: {
    patterns: [
      /#include\s*<\w+>/,
      /#include\s*"[\w.]+"/,
      /\bstd::/,
      /\bcout\s*<</,
      /\bcin\s*>>/,
      /\bendl\b/,
      /\busing\s+namespace\s+std/,
      /\btemplate\s*</,
      /\btypename\s+\w+/,
      /\bvector\s*</,
      /\bclass\s+\w+\s*{/,
      /\bpublic:/,
      /\bprivate:/,
      /\bprotected:/,
      /\bvirtual\s+\w+/,
      /\bconst\s+\w+\s*&/,
      /\w+::\w+\s*\(/,
      /->/,
      /\bnullptr\b/,
    ],
    weight: 1,
  },
  c: {
    patterns: [
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /#include\s*<string\.h>/,
      /\bprintf\s*\(/,
      /\bscanf\s*\(/,
      /\bmalloc\s*\(/,
      /\bfree\s*\(/,
      /\bsizeof\s*\(/,
      /\bint\s+main\s*\(/,
      /\bvoid\s+\w+\s*\(/,
      /\bstruct\s+\w+\s*{/,
      /\btypedef\s+struct/,
      /\bNULL\b/,
      /#define\s+\w+/,
      /#ifndef\s+\w+/,
      /#endif/,
      /\bchar\s*\*/,
      /\bint\s*\*/,
    ],
    weight: 1,
    negative: [/\bstd::/, /\bcout/, /\bclass\s+\w+\s*{/, /\bpublic:/, /\bnamespace/],
  },
  go: {
    patterns: [
      /\bpackage\s+main\b/,
      /\bfunc\s+\w+\s*\(/,
      /\bfunc\s+\(\w+\s+\*?\w+\)/,
      /\bimport\s+\(/,
      /\bimport\s+"[\w/]+"/,
      /\bfmt\.Print/,
      /\bfmt\.Sprintf/,
      /:=\s*/,
      /\bgo\s+\w+\(/,
      /\bchan\s+\w+/,
      /\bdefer\s+\w+/,
      /\bgoroutine/,
      /\bmake\s*\(\s*\[\]/,
      /\bmake\s*\(\s*map\[/,
      /\binterface\s*{}/,
      /\bstruct\s*{/,
      /\bnil\b/,
      /\berr\s*!=\s*nil/,
    ],
    weight: 1,
  },
  javascript: {
    patterns: [
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bvar\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /\bfunction\s*\(/,
      /=>\s*{/,
      /=>\s*\w+/,
      /\bconsole\.log\s*\(/,
      /\bdocument\./,
      /\bwindow\./,
      /\brequire\s*\(/,
      /\bmodule\.exports/,
      /\bexport\s+default/,
      /\bexport\s+\{/,
      /\bimport\s+.*\s+from\s+['"]/,
      /\basync\s+function/,
      /\bawait\s+\w+/,
      /\.then\s*\(/,
      /\.catch\s*\(/,
      /\bnew\s+Promise\s*\(/,
      /\bundefined\b/,
      /===|!==/,
      /\$\{.*\}/,
    ],
    weight: 1,
  },
  html: {
    patterns: [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<div[\s>]/i,
      /<span[\s>]/i,
      /<script[\s>]/i,
      /<style[\s>]/i,
      /<link[\s>]/i,
      /<meta[\s>]/i,
      /<img[\s>]/i,
      /<a\s+href/i,
      /<form[\s>]/i,
      /<input[\s>]/i,
      /<button[\s>]/i,
      /<\/\w+>/,
      /class="[\w\s-]+"/,
      /id="[\w-]+"/,
    ],
    weight: 1,
    // HTML 不应该有 XML 声明
    negative: [/<\?xml/i],
  },
  xml: {
    patterns: [
      /<\?xml\s+version=/i, // <?xml version=
      /<\w+:\w+/, // 命名空间前缀 <ns:tag
      /xmlns(:\w+)?=/, // xmlns= 或 xmlns:prefix=
      /<!\[CDATA\[/, // CDATA
      /<!--[\s\S]*?-->/, // XML 注释
      /<\/\w+:\w+>/, // </ns:tag>
      /<\w+\s+[\w:]+="[^"]*"\s*\/?>/, // 带属性的标签
      /<\w+\/>/, // 自闭合标签
      /<(beans|configuration|project|dependencies|dependency|plugin|resources)\b/i, // 常见 XML 根元素
      /<(web-app|persistence|hibernate-mapping|mapper)\b/i,
      /<(manifest|application|activity)\b/i, // Android
      /<(plist|dict|key|string|array)\b/i, // plist
      /<(svg|g|path|rect|circle)\b/i, // SVG
      /<(rss|channel|item|feed|entry)\b/i, // RSS/Atom
    ],
    weight: 1,
  },
  css: {
    patterns: [
      /^[\w.#\[\]:,\s-]+\s*{/m,
      /^\s*[\w-]+\s*:\s*[^;]+;/m,
      /\bcolor\s*:/,
      /\bbackground\s*:/,
      /\bmargin\s*:/,
      /\bpadding\s*:/,
      /\bdisplay\s*:/,
      /\bposition\s*:/,
      /\bwidth\s*:/,
      /\bheight\s*:/,
      /\bfont-size\s*:/,
      /\bfont-family\s*:/,
      /@media\s*\(/,
      /@import\s+/,
      /@keyframes\s+\w+/,
      /\bflex\b/,
      /\bgrid\b/,
      /\b!important\b/,
      /^\s*\.\w+[\s{]/m,
      /^\s*#\w+[\s{]/m,
    ],
    weight: 1,
  },
}

// 精准语言检测函数
function detectLanguage(code) {
  if (!code || code.trim().length < 10) {
    return null
  }

  var scores = {}
  var negativeMatches = {}

  for (var lang in languagePatterns) {
    var config = languagePatterns[lang]
    var score = 0

    for (var i = 0; i < config.patterns.length; i++) {
      var pattern = config.patterns[i]
      var matches = code.match(pattern)
      if (matches) {
        score += config.weight
        if (
          pattern.toString().includes('import') ||
          pattern.toString().includes('class') ||
          pattern.toString().includes('def ') ||
          pattern.toString().includes('func ')
        ) {
          score += 0.5
        }
      }
    }

    if (config.negative) {
      for (var j = 0; j < config.negative.length; j++) {
        if (config.negative[j].test(code)) {
          negativeMatches[lang] = true
          break
        }
      }
    }

    scores[lang] = score
  }

  for (var langKey in negativeMatches) {
    scores[langKey] = scores[langKey] * 0.3
  }

  // 特殊规则处理
  // Java vs C#
  if (scores.java > 0 && scores.csharp > 0) {
    if (
      /\busing\s+System/.test(code) ||
      /\bnamespace\s+\w+/.test(code) ||
      /\bConsole\./.test(code)
    ) {
      scores.java *= 0.3
    }
    if (
      /\bSystem\.out\./.test(code) ||
      /\bimport\s+java\./.test(code) ||
      /\b@Override/.test(code)
    ) {
      scores.csharp *= 0.3
    }
  }

  // C vs C++
  if (scores.c > 0 && scores.cpp > 0) {
    if (
      /\bstd::/.test(code) ||
      /\bcout/.test(code) ||
      /\bclass\s+\w+/.test(code) ||
      /\btemplate\s*</.test(code)
    ) {
      scores.c *= 0.2
    }
    if (!/\bstd::/.test(code) && !/\bcout/.test(code) && !/\bclass\s+\w+\s*{/.test(code)) {
      if (/\bprintf\s*\(/.test(code) || /\bscanf\s*\(/.test(code) || /\bmalloc\s*\(/.test(code)) {
        scores.cpp *= 0.3
      }
    }
  }

  // JavaScript vs Java/C#
  if (scores.javascript > 0 && (scores.java > 0 || scores.csharp > 0)) {
    if (
      /\bconsole\.log/.test(code) ||
      /\bconst\s+\w+\s*=/.test(code) ||
      /\blet\s+\w+\s*=/.test(code) ||
      /=>/.test(code)
    ) {
      scores.java *= 0.3
      scores.csharp *= 0.3
    }
    if (/\bpublic\s+class/.test(code) || /\bprivate\s+\w+/.test(code)) {
      scores.javascript *= 0.3
    }
  }

  // HTML vs XML
  if (scores.html > 0 && scores.xml > 0) {
    // 如果有 XML 声明或命名空间，优先 XML
    if (/<\?xml/.test(code) || /xmlns/.test(code) || /<\w+:\w+/.test(code)) {
      scores.html *= 0.2
    }
    // 如果有 HTML5 DOCTYPE 或常见 HTML 标签，优先 HTML
    if (/<!DOCTYPE\s+html>/i.test(code) || /<html[\s>]/i.test(code) || /<body[\s>]/i.test(code)) {
      scores.xml *= 0.3
    }
  }

  var maxScore = 0
  var detectedLang = null

  for (var l in scores) {
    if (scores[l] > maxScore) {
      maxScore = scores[l]
      detectedLang = l
    }
  }

  if (maxScore < 2) {
    return null
  }

  return detectedLang
}

const props = defineProps({
  attributes: {
    type: Object,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:attributes'])

const store = useEditorStore()
const codeRef = ref(null)
const isComposing = ref(false)
const isEditing = ref(false)
const copySuccess = ref(false)

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

const language = computed(function () {
  return props.attributes.language || 'auto'
})

const theme = computed({
  get: function () {
    return props.attributes.theme || 'dark'
  },
  set: function (val) {
    emit('update:attributes', { theme: val })
    store.commitBlockChanges()
  },
})

// 检测到的语言
const detectedLanguage = computed(function () {
  if (language.value !== 'auto') {
    return language.value
  }
  return detectLanguage(content.value)
})

// 实际用于高亮的语言
const effectiveLanguage = computed(function () {
  return detectedLanguage.value || null
})

// 语言显示名称映射
const languageLabels = {
  auto: '代码',
  java: 'Java',
  python: 'Python',
  c: 'C',
  csharp: 'C#',
  cpp: 'C++',
  go: 'Go',
  html: 'HTML',
  xml: 'XML',
  javascript: 'JavaScript',
  css: 'CSS',
}

// 获取显示的语言名称
const displayLanguage = computed(function () {
  if (language.value === 'auto') {
    if (detectedLanguage.value) {
      return languageLabels[detectedLanguage.value] || detectedLanguage.value.toUpperCase()
    }
    return '代码'
  }
  return languageLabels[language.value] || language.value.toUpperCase()
})

// 获取高亮后的 HTML
const highlightedCode = computed(function () {
  if (!content.value) {
    return '<span class="code-placeholder">输入代码…</span>'
  }

  var langToUse = effectiveLanguage.value

  if (!langToUse) {
    return escapeHtml(content.value)
  }

  try {
    var result = hljs.highlight(content.value, {
      language: langToUse,
      ignoreIllegals: true,
    })
    return result.value
  } catch (e) {
    return escapeHtml(content.value)
  }
})

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function handleInput(e) {
  content.value = e.target.value || ''
  autoResize(e.target)

  if (!isComposing.value) {
    store.commitBlockChanges()
  }
}

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd(e) {
  isComposing.value = false
  content.value = e.target.value || ''
  store.commitBlockChanges()
}

function autoResize(textarea) {
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

function startEdit() {
  isEditing.value = true
  nextTick(function () {
    if (codeRef.value) {
      codeRef.value.focus()
      codeRef.value.selectionStart = codeRef.value.selectionEnd = content.value.length
      autoResize(codeRef.value)
    }
  })
}

function finishEdit() {
  isEditing.value = false
  store.commitBlockChanges()
}

function handleKeyDown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    var textarea = e.target
    var start = textarea.selectionStart
    var end = textarea.selectionEnd
    var value = textarea.value

    textarea.value = value.substring(0, start) + '  ' + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 2

    content.value = textarea.value
  }

  if (e.key === 'Escape') {
    finishEdit()
  }
}

function copyCode() {
  if (!content.value) return

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(content.value)
      .then(function () {
        showCopySuccess()
      })
      .catch(function () {
        fallbackCopy()
      })
  } else {
    fallbackCopy()
  }
}

function fallbackCopy() {
  var textarea = document.createElement('textarea')
  textarea.value = content.value
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    showCopySuccess()
  } catch (e) {
    console.warn('复制失败')
  }
  document.body.removeChild(textarea)
}

function showCopySuccess() {
  copySuccess.value = true
  setTimeout(function () {
    copySuccess.value = false
  }, 2000)
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      isEditing.value = false
    }
  },
)

onMounted(function () {
  if (codeRef.value) {
    autoResize(codeRef.value)
  }
})
</script>

<template>
  <div
    class="wp-block-code-wrapper"
    :class="{
      'is-selected': isSelected,
      'is-dark': theme === 'dark',
      'is-light': theme === 'light',
    }"
  >
    <!-- Header（非选中状态显示） -->
    <div v-if="!isSelected" class="code-header">
      <span class="code-language">{{ displayLanguage }}</span>
      <div class="code-actions">
        <button
          type="button"
          class="code-action-btn"
          :class="{ 'is-success': copySuccess }"
          :title="copySuccess ? '已复制' : '复制代码'"
          @click.stop="copyCode"
        >
          <svg v-if="!copySuccess" viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
              fill="currentColor"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          class="code-action-btn"
          :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          @click.stop="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
              fill="currentColor"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-if="isEditing" class="code-editor">
      <textarea
        ref="codeRef"
        class="code-textarea"
        :value="content"
        placeholder="输入代码…"
        spellcheck="false"
        @input="handleInput"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @keydown="handleKeyDown"
        @blur="finishEdit"
      ></textarea>
    </div>

    <!-- 预览模式（带语法高亮） -->
    <pre v-else class="wp-block-code" @click="startEdit">
      <code
        class="hljs"
        :class="effectiveLanguage ? 'language-' + effectiveLanguage : ''"
        v-html="highlightedCode"
      ></code>
    </pre>
  </div>
</template>

<style scoped>
.wp-block-code-wrapper {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}

/* 深色主题 */
.wp-block-code-wrapper.is-dark {
  background: #1e1e1e;
}

.wp-block-code-wrapper.is-dark .code-header {
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  color: #a0a0a0;
}

.wp-block-code-wrapper.is-dark .code-action-btn {
  color: #a0a0a0;
}

.wp-block-code-wrapper.is-dark .code-action-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.wp-block-code-wrapper.is-dark .code-textarea,
.wp-block-code-wrapper.is-dark .wp-block-code {
  background: #1e1e1e;
  color: #d4d4d4;
}

.wp-block-code-wrapper.is-dark .code-textarea::placeholder {
  color: #6a6a6a;
}

/* 浅色主题 */
.wp-block-code-wrapper.is-light {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
}

.wp-block-code-wrapper.is-light .code-header {
  background: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

.wp-block-code-wrapper.is-light .code-action-btn {
  color: #666;
}

.wp-block-code-wrapper.is-light .code-action-btn:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.wp-block-code-wrapper.is-light .code-textarea,
.wp-block-code-wrapper.is-light .wp-block-code {
  background: #f8f8f8;
  color: #333;
}

.wp-block-code-wrapper.is-light .code-textarea::placeholder {
  color: #999;
}

/* 选中状态边框 */
.wp-block-code-wrapper.is-selected {
  outline: 2px solid #007cba;
  outline-offset: -2px;
}

/* Header */
.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 12px;
}

.code-language {
  font-weight: 500;
}

.code-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.code-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-action-btn.is-success {
  color: #22c55e !important;
}

/* 编辑器 */
.code-editor {
  position: relative;
}

.code-textarea {
  width: 100%;
  min-height: 60px;
  padding: 12px 16px;
  margin: 0;
  border: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  white-space: pre;
  overflow-wrap: normal;
  overflow: hidden;
  box-sizing: border-box;
  tab-size: 2;
}

.wp-block-code {
  margin: 0;
  padding: 16px 16px 0px 16px;
  overflow: hidden;
  cursor: text;
}

.wp-block-code code {
  display: block;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  tab-size: 2;
}

.wp-block-code code.hljs {
  background: transparent;
  padding: 0;
}

:deep(.code-placeholder) {
  opacity: 0.5;
}

/* ===== 深色主题语法高亮 ===== */
.is-dark :deep(.hljs-keyword) {
  color: #569cd6;
}
.is-dark :deep(.hljs-built_in) {
  color: #4ec9b0;
}
.is-dark :deep(.hljs-type) {
  color: #4ec9b0;
}
.is-dark :deep(.hljs-literal) {
  color: #569cd6;
}
.is-dark :deep(.hljs-number) {
  color: #b5cea8;
}
.is-dark :deep(.hljs-string) {
  color: #ce9178;
}
.is-dark :deep(.hljs-regexp) {
  color: #d16969;
}
.is-dark :deep(.hljs-symbol) {
  color: #569cd6;
}
.is-dark :deep(.hljs-variable) {
  color: #9cdcfe;
}
.is-dark :deep(.hljs-template-variable) {
  color: #9cdcfe;
}
.is-dark :deep(.hljs-tag) {
  color: #569cd6;
}
.is-dark :deep(.hljs-name) {
  color: #569cd6;
}
.is-dark :deep(.hljs-attr) {
  color: #9cdcfe;
}
.is-dark :deep(.hljs-attribute) {
  color: #9cdcfe;
}
.is-dark :deep(.hljs-function) {
  color: #dcdcaa;
}
.is-dark :deep(.hljs-title) {
  color: #dcdcaa;
}
.is-dark :deep(.hljs-title.function_) {
  color: #dcdcaa;
}
.is-dark :deep(.hljs-params) {
  color: #9cdcfe;
}
.is-dark :deep(.hljs-comment) {
  color: #6a9955;
}
.is-dark :deep(.hljs-doctag) {
  color: #608b4e;
}
.is-dark :deep(.hljs-meta) {
  color: #9b9b9b;
}
.is-dark :deep(.hljs-meta-keyword) {
  color: #569cd6;
}
.is-dark :deep(.hljs-meta-string) {
  color: #ce9178;
}
.is-dark :deep(.hljs-section) {
  color: #569cd6;
}
.is-dark :deep(.hljs-subst) {
  color: #9cdcfe;
}

/* ===== 浅色主题语法高亮 ===== */
.is-light :deep(.hljs-keyword) {
  color: #0000ff;
}
.is-light :deep(.hljs-built_in) {
  color: #267f99;
}
.is-light :deep(.hljs-type) {
  color: #267f99;
}
.is-light :deep(.hljs-literal) {
  color: #0000ff;
}
.is-light :deep(.hljs-number) {
  color: #098658;
}
.is-light :deep(.hljs-string) {
  color: #a31515;
}
.is-light :deep(.hljs-regexp) {
  color: #811f3f;
}
.is-light :deep(.hljs-symbol) {
  color: #0000ff;
}
.is-light :deep(.hljs-variable) {
  color: #001080;
}
.is-light :deep(.hljs-template-variable) {
  color: #001080;
}
.is-light :deep(.hljs-tag) {
  color: #800000;
}
.is-light :deep(.hljs-name) {
  color: #800000;
}
.is-light :deep(.hljs-attr) {
  color: #ff0000;
}
.is-light :deep(.hljs-attribute) {
  color: #ff0000;
}
.is-light :deep(.hljs-function) {
  color: #795e26;
}
.is-light :deep(.hljs-title) {
  color: #795e26;
}
.is-light :deep(.hljs-title.function_) {
  color: #795e26;
}
.is-light :deep(.hljs-params) {
  color: #001080;
}
.is-light :deep(.hljs-comment) {
  color: #008000;
}
.is-light :deep(.hljs-doctag) {
  color: #008000;
}
.is-light :deep(.hljs-meta) {
  color: #808080;
}
.is-light :deep(.hljs-meta-keyword) {
  color: #0000ff;
}
.is-light :deep(.hljs-meta-string) {
  color: #a31515;
}
.is-light :deep(.hljs-section) {
  color: #0000ff;
}
.is-light :deep(.hljs-subst) {
  color: #001080;
}
</style>
