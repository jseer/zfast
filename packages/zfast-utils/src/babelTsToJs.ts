import * as babel from "@babel/core";

export default async function babelTsToJs(content: string, opts?: any) {
  return babel.transform(content, {
    plugins: [[require.resolve("@babel/plugin-transform-typescript"), opts]],
  });
}
