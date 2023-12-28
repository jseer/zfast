import hljs from "highlight.js";

export function highlight(
  content: string,
  language: string,
  langAttrs: string
) {
  return hljs.highlight(content, { language }).value;
}
