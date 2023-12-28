import { App } from "zfast";
import { IPlugin } from "@zfast/core";
import { ALL_RULE } from "@zfast/webpack";

const plugin: IPlugin<App> = ({ hooks, pkg, cwd }) => {
  hooks.chainWebpack.add(async (config) => {
    const babel = config.module
      .rule(ALL_RULE)
      .oneOf("javascript")
      .use("babel-loader")
      .entries();
    config.module
      .rule(ALL_RULE)
      .oneOf("md")
      .test(/\.md$/)
      .use("babel-loader")
      .loader(babel.loader)
      .options(babel.options)
      .end()
      .use("md-loader")
      .loader(require.resolve("../loaders/markdown"))
      .options({
        pkg,
        cwd,
      });
  });
  hooks.convertFileToRoutesOpts.add(async (opts) => {
    opts.extensions = [".tsx", ".ts", ".js", ".jsx", '.md'];
    return opts
  })
  hooks.entryImports.add(async() => {
    return {
      source: require.resolve('highlight.js/styles/vs2015.min.css')
    }
  })
};

export { plugin };
