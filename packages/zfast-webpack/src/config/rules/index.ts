import Config from "webpack-chain";
import addJavascriptRules from "./javascriptRules";
import type { ApplyOpts } from "..";
import addAssetRules from "./assetRules";
import addCssRules from "./cssRules";

const ALL_RULE = 'allRule';
export { ALL_RULE }
export default function addRules(config: Config, opts: ApplyOpts) {
  config.module.set("parser", {
    javascript: {
      exportsPresence: "error",
    },
  });

  const allRule = config.module.rule(ALL_RULE);
  addJavascriptRules(allRule, opts);
  addAssetRules(allRule, opts);
  addCssRules(allRule, opts);
}
