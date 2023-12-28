import MarkdownIt from "markdown-it";
import { highlight } from "./highlight";
import anchorPlugin from "markdown-it-anchor";
import emojiPlugin from "markdown-it-emoji";
import containerPlugin from "markdown-it-container";

export function transform(content: string, opts: any) {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: opts.highlight || highlight,
  });
  md.linkify.set({ fuzzyLink: false });
  // md.use(emojiPlugin).use(anchorPlugin);
  const ret = md.render(content);
  return ret;
}
