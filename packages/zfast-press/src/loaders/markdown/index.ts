import type { LoaderContext } from "webpack";
import { MdLoaderOpts } from "../../types";
import { transform } from "./transform";
import { writeTplFile } from "@zfast/utils";

function generate(content: string) {
  return writeTplFile({
    tpl: `
  import React from 'react';
  function MarkdownContent() {
    return (
      <div>
        ${content}
      </div>
    )
  }
  export default MarkdownContent;
    `,
    outputPath: false,
  });
}
export default function mdLoader(
  this: LoaderContext<MdLoaderOpts>,
  content: string
) {
  const cb = this.async();
  const transformOpts = {
    ...this.getOptions(),
  };
  const ret = transform(content, transformOpts);
  generate(ret).then((result) => {
    cb(null, result);
  });
}
