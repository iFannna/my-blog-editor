/**
 * SVG 图标
 */

export const icons = {
  // 左侧边栏
  plus: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z"/></svg>',

  // 撤销
  undo: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 .3.3.5.8.5 1.2v4h1.5v-4c0-.8-.3-1.6-.9-2.2l-.1-.1z"/></svg>',

  // 重做
  redo: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9l-.1.1c-.6.6-.9 1.4-.9 2.2v4H6.2v-4c0-.5.2-.9.5-1.2.3-.3.8-.5 1.3-.5h9.3l-2.7 2.7 1 1 4.5-4.5-4.5-5z"/></svg>',

  // 右侧边栏
  cog: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 14.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h8v13zm4.5-.5c0 .3-.2.5-.5.5h-2.5v-13H18c.3 0 .5.2.5.5v12z"></path></svg>',

  // 更多选项
  moreVertical:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/></svg>',

  // 段落
  paragraph:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.3 4H9.9C7.1 4 4.9 6.2 4.9 9s2.2 5 5 5h1.3v6h1.5V5.5h2.8V20h1.5V5.5h1.3V4z"/></svg>',

  // 标题
  heading:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 5V18.5911L12 13.8473L18 18.5911V5H6Z"></path></svg>',

  // 列表
  list: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4 4v1.5h16V4H4zm8 8.5h8V11h-8v1.5zM4 20h16v-1.5H4V20zm4-8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"></path></svg>',

  // 引用
  quote:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 6v6h5.2v4c0 .8-.2 1.4-.5 1.7-.6.6-1.6.6-2.5.5h-.3v1.5h.5c1.2 0 2.3-.1 3.1-1 .6-.6 1-1.6 1-2.8V6H13zM4 6v6h5.2v4c0 .8-.2 1.4-.5 1.7-.6.6-1.6.6-2.5.5h-.3v1.5h.5c1.2 0 2.3-.1 3.1-1 .6-.6 1-1.6 1-2.8V6H4z"/></svg>',

  // 代码
  code: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1.1-1.1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.2c-.2-.1-.2-.3 0-.4z"/></svg>',

  // 详细/详情
  details:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4 16h10v1.5H4V16Zm0-4.5h16V13H4v-1.5ZM10 7h10v1.5H10V7Z" fill-rule="evenodd" clip-rule="evenodd"></path><path d="m4 5.25 4 2.5-4 2.5v-5Z"></path></svg>',

  // 数学/公式
  formula:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" _mstVisible="18"><path d="M11.2 6.8c-.7 0-1.4.5-1.6 1.1l-2.8 7.5-1.2-1.8c-.1-.2-.4-.3-.6-.3H3v1.5h1.6l1.2 1.8c.6.9 1.9.7 2.2-.3l2.9-7.9s.1-.2.2-.2h7.8V6.7h-7.8Zm5.3 3.4-1.9 1.9-1.9-1.9-1.1 1.1 1.9 1.9-1.9 1.9 1.1 1.1 1.9-1.9 1.9 1.9 1.1-1.1-1.9-1.9 1.9-1.9-1.1-1.1Z" _mstVisible="19"></path></svg>',

  // 表格
  table:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v3.5h-15V5c0-.3.2-.5.5-.5zm8 5.5h6.5v3.5H13V10zm-1.5 3.5h-7V10h7v3.5zm-7 5.5v-4h7v4.5H5c-.3 0-.5-.2-.5-.5zm14.5.5h-6V15h6.5v4c0 .3-.2.5-.5.5z"></path></svg>',

  // 诗歌/预格式化
  verse:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M17.8 2l-.9.3c-.1 0-3.6 1-5.2 2.1C10 5.5 9.3 6.5 8.9 7.1c-.6.9-1.7 4.7-1.7 6.3l-.9 2.3c-.2.4 0 .8.4 1 .1 0 .2.1.3.1.3 0 .6-.2.7-.5l.6-1.5c.3 0 .7-.1 1.2-.2.7-.1 1.4-.3 2.2-.5.8-.2 1.6-.5 2.4-.8.7-.3 1.4-.7 1.9-1.2s.8-1.2 1-1.9c.2-.7.3-1.6.4-2.4.1-.8.1-1.7.2-2.5 0-.8.1-1.5.2-2.1V2zm-1.9 5.6c-.1.8-.2 1.5-.3 2.1-.2.6-.4 1-.6 1.3-.3.3-.8.6-1.4.9-.7.3-1.4.5-2.2.8-.6.2-1.3.3-1.8.4L15 7.5c.3-.3.6-.7 1-1.1 0 .4 0 .8-.1 1.2zM6 20h8v-1.5H6V20z"></path></svg>',

  // 图片
  image:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z"/></svg>',

  // 画廊
  gallery:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M16.375 4.5H4.625a.125.125 0 0 0-.125.125v8.254l2.859-1.54a.75.75 0 0 1 .68-.016l2.384 1.142 2.89-2.074a.75.75 0 0 1 .874 0l2.313 1.66V4.625a.125.125 0 0 0-.125-.125Zm.125 9.398-2.75-1.975-2.813 2.02a.75.75 0 0 1-.76.067l-2.444-1.17L4.5 14.583v1.792c0 .069.056.125.125.125h11.75a.125.125 0 0 0 .125-.125v-2.477ZM4.625 3C3.728 3 3 3.728 3 4.625v11.75C3 17.273 3.728 18 4.625 18h11.75c.898 0 1.625-.727 1.625-1.625V4.625C18 3.728 17.273 3 16.375 3H4.625ZM20 8v11c0 .69-.31 1-.999 1H6v1.5h13.001c1.52 0 2.499-.982 2.499-2.5V8H20Z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',

  // 音频
  audio:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M17.7 4.3c-1.2 0-2.8 0-3.8 1-.6.6-.9 1.5-.9 2.6V14c-.6-.6-1.5-1-2.5-1C8.6 13 7 14.6 7 16.5S8.6 20 10.5 20c1.5 0 2.8-1 3.3-2.3.5-.8.7-1.8.7-2.5V7.9c0-.7.2-1.2.5-1.6.6-.6 1.8-.6 2.8-.6h.3V4.3h-.4z"></path></svg>',

  // 封面
  cover:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18.7 3H5.3C4 3 3 4 3 5.3v13.4C3 20 4 21 5.3 21h13.4c1.3 0 2.3-1 2.3-2.3V5.3C21 4 20 3 18.7 3zm.8 15.7c0 .4-.4.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V5.3c0-.4.4-.8.8-.8h6.2v8.9l2.5-3.1 2.5 3.1V4.5h2.2c.4 0 .8.4.8.8v13.4z"></path></svg>',

  // 档案/文件
  file: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.848 8a1 1 0 0 1-.914-.594l-.723-1.63a.5.5 0 0 0-.447-.276H5a.5.5 0 0 0-.5.5v11.5a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5v-9A.5.5 0 0 0 19 8h-6.152Zm.612-1.5a.5.5 0 0 1-.462-.31l-.445-1.084A2 2 0 0 0 10.763 4H5a2 2 0 0 0-2 2v11.5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-5.54Z"></path></svg>',

  // 媒体与文本
  mediaText:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M3 6v11.5h8V6H3Zm11 3h7V7.5h-7V9Zm7 3.5h-7V11h7v1.5ZM14 16h7v-1.5h-7V16Z"></path></svg>',

  // 视频
  video:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18.7 3H5.3C4 3 3 4 3 5.3v13.4C3 20 4 21 5.3 21h13.4c1.3 0 2.3-1 2.3-2.3V5.3C21 4 20 3 18.7 3zm.8 15.7c0 .4-.4.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V5.3c0-.4.4-.8.8-.8h13.4c.4 0 .8.4.8.8v13.4zM10 15l5-3-5-3v6z"></path></svg>',

  // 手风琴/折叠
  accordion:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 9.25L9.5 9.25L9.5 7.75L19.5 7.75L19.5 9.25Z" fill="currentColor"></path><path d="M4.5 6L8.5 8.5L4.5 11L4.5 6Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 16.25L9.5 16.25L9.5 14.75L19.5 14.75L19.5 16.25Z" fill="currentColor"></path><path d="M4.5 13L8.5 15.5L4.5 18L4.5 13Z" fill="currentColor"></path></svg>',

  // 按钮
  button:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M14.5 17.5H9.5V16H14.5V17.5Z M14.5 8H9.5V6.5H14.5V8Z M7 3.5H17C18.1046 3.5 19 4.39543 19 5.5V9C19 10.1046 18.1046 11 17 11H7C5.89543 11 5 10.1046 5 9V5.5C5 4.39543 5.89543 3.5 7 3.5ZM17 5H7C6.72386 5 6.5 5.22386 6.5 5.5V9C6.5 9.27614 6.72386 9.5 7 9.5H17C17.2761 9.5 17.5 9.27614 17.5 9V5.5C17.5 5.22386 17.2761 5 17 5Z M7 13H17C18.1046 13 19 13.8954 19 15V18.5C19 19.6046 18.1046 20.5 17 20.5H7C5.89543 20.5 5 19.6046 5 18.5V15C5 13.8954 5.89543 13 7 13ZM17 14.5H7C6.72386 14.5 6.5 14.7239 6.5 15V18.5C6.5 18.7761 6.72386 19 7 19H17C17.2761 19 17.5 18.7761 17.5 18.5V15C17.5 14.7239 17.2761 14.5 17 14.5Z"></path></svg>',

  // 列/柱子
  columns:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 7.5h-5v10h5v-10Zm1.5 0v10H19a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5h-2.5ZM6 7.5h2.5v10H6a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5ZM6 6h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"></path></svg>',

  // 网格
  grid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="m3 5c0-1.10457.89543-2 2-2h13.5c1.1046 0 2 .89543 2 2v13.5c0 1.1046-.8954 2-2 2h-13.5c-1.10457 0-2-.8954-2-2zm2-.5h6v6.5h-6.5v-6c0-.27614.22386-.5.5-.5zm-.5 8v6c0 .2761.22386.5.5.5h6v-6.5zm8 0v6.5h6c.2761 0 .5-.2239.5-.5v-6zm0-8v6.5h6.5v-6c0-.27614-.2239-.5-.5-.5z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',

  // 分隔符
  separator:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4.5 12.5v4H3V7h1.5v3.987h15V7H21v9.5h-1.5v-4h-15Z"></path></svg>',

  // 间隔
  spacer:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h14v1.5H5V5zM5 17.5h14V19H5v-1.5zM11.2 8.2l-.8.8 1.4 1.5H5v1.5h6.8l-1.4 1.5.8.8 2.8-2.8-2.8-2.8zM12.8 15.8l.8-.8-1.4-1.5H19v-1.5h-6.8l1.4-1.5-.8-.8-2.8 2.8 2.8 2.8z"/></svg>',

  // 组
  group:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 4h-7c-1.1 0-2 .9-2 2v3H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-3h3c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5v-7c0-.3.2-.5.5-.5h3V13c0 1.1.9 2 2 2h2.5v3zm0-4.5H11c-.3 0-.5-.2-.5-.5v-2.5H13c.3 0 .5.2.5.5v2.5zm5-3c0 .3-.2.5-.5.5h-3v-2.5c0-.3.2-.5.5-.5H18c.3 0 .5.2.5.5V10.5z"/></svg>',

  // 加粗
  bold: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 11.3c1-.6 1.5-1.6 1.5-3 0-2.3-1.3-3.4-4-3.4H7v14h5.8c1.4 0 2.5-.3 3.3-1 .8-.7 1.2-1.7 1.2-2.9.1-1.9-.8-3.1-2.6-3.7zm-5.1-4h2.3c.6 0 1.1.1 1.4.4.3.3.5.7.5 1.2s-.2.9-.5 1.1c-.3.3-.8.4-1.4.4H9.6V7.3zm4.6 9c-.4.3-1 .4-1.7.4H9.6v-3.9h2.9c.7 0 1.3.2 1.7.5.4.3.6.8.6 1.5s-.2 1.2-.6 1.5z"/></svg>',

  // 斜体
  italic:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 5L10 19h1.9l2.5-14z"/></svg>',

  // 删除线
  strikethrough:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.1 9v-.5c0-.6.2-1.1.7-1.4.5-.3 1.2-.5 2-.5.7 0 1.4.1 2.1.3.7.2 1.4.5 2.1.9l.2-1.9c-.6-.3-1.2-.5-1.9-.7-.8-.1-1.6-.2-2.4-.2-1.5 0-2.7.3-3.6 1-.9.7-1.3 1.6-1.3 2.8 0 .9.2 1.7.7 2.2H5v1.5h14v-1.5h-4.3c-.4-.2-.8-.4-1.2-.5-.6-.2-1.3-.3-2-.3l-.8-.1c-.7-.1-1.2-.3-1.6-.5-.4-.2-.6-.5-.6-.9zM15 15v.5c0 .6-.2 1.1-.7 1.4-.5.3-1.2.5-2.1.5-.8 0-1.6-.1-2.4-.4-.8-.2-1.5-.6-2.1-1l-.2 1.9c.6.3 1.3.6 2 .8.8.2 1.7.3 2.6.3 1.5 0 2.7-.3 3.6-1 .9-.7 1.3-1.6 1.3-2.8 0-.2 0-.4 0-.6H15z"/></svg>',

  // 链接
  link: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.6 7.2H14v1.5h1.6c2 0 3.7 1.7 3.7 3.7s-1.7 3.7-3.7 3.7H14v1.5h1.6c2.8 0 5.2-2.3 5.2-5.2 0-2.9-2.3-5.2-5.2-5.2zM4.7 12.4c0-2 1.7-3.7 3.7-3.7H10V7.2H8.4c-2.9 0-5.2 2.3-5.2 5.2 0 2.9 2.3 5.2 5.2 5.2H10v-1.5H8.4c-2 0-3.7-1.7-3.7-3.7zm4.6.5h5.3v-1.5H9.3v1.5z"/></svg>',

  // 内联代码
  codeInline:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',

  // 上移
  chevronUp:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"/></svg>',

  // 下移
  chevronDown:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"/></svg>',

  // 删除
  trash:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 5h-5.7c0-1.3-1-2.4-2.3-2.4S9.7 3.7 9.7 5H4v1.5h1.5v13c0 .8.7 1.5 1.5 1.5h10c.8 0 1.5-.7 1.5-1.5v-13H20V5zM12 4c.4 0 .8.3.8.8v.2h-1.6v-.2c0-.4.4-.8.8-.8zM17 6.5v13H7v-13h10z"/></svg>',

  // 拖拽手柄
  dragHandle:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z"/></svg>',

  // 展开
  chevronRight:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z"/></svg>',

  // 关闭
  close:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 11.8l3.8-3.8-1.1-1.1-3.8 3.8-3.8-3.8-1 1.1 3.7 3.8-3.8 3.8 1.1 1 3.8-3.8 3.8 3.8 1-1-3.7-3.8z"/></svg>',

  // 有序列表
  listOrdered:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.1 15.8H20v-1.5h-8.9v1.5zm0-8.6v1.5H20V7.2h-8.9zM5 6.7V10h1V5.3H5.4L4 6v.7l1-.5v.5zm.5 5.7c-.4 0-.7.1-.9.3-.2.2-.4.5-.4.8h1c0-.2.1-.4.4-.4.2 0 .4.1.5.3.1.2.1.5.1.9l-.8.8c-.5.5-.8.9-.9 1.2v.5h2.7v-.8H5.4c.1-.1.3-.3.5-.5l.8-.7c.3-.3.5-.7.5-1.1 0-.5-.1-.8-.4-1.1-.3-.2-.6-.3-1-.3h.2z"/></svg>',

  // 播放
  play: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>',

  // 复制
  copy: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',

  // 剪切
  cut: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"/></svg>',

  // 粘贴
  paste:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>',
  // 在现有 icons 对象中添加以下图标:

  // 高亮/画笔
  highlight:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.24 2c.54 0 1.05.21 1.43.59l2.74 2.74c.79.79.79 2.07 0 2.86l-9.9 9.9c-.38.38-.89.59-1.42.59H4.5a1 1 0 0 1-1-1v-3.59c0-.53.21-1.04.59-1.42l9.9-9.9a2.02 2.02 0 0 1 1.43-.59zM5.5 16.09V18h1.91l9.36-9.36-1.91-1.91-9.36 9.36z"/></svg>',
  // 间隔
  spacer: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M7 18h4.5v1.5h-7v-7H6V17L17 6h-4.5V4.5h7v7H18V7L7 18Z"></path></svg>`,
}

/**
 * 创建图标 HTML
 */
export function getIcon(name) {
  return icons[name] || ''
}
