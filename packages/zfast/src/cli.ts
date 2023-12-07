import commander from "commander";
import build, { type BuildOpts } from "./build";
import dev from "./dev";

const { program } = commander;

program
  .command("build")
  .description("build for production")
  .argument("[root]", "project path")
  .option('-c, --config [configFile]', 'config file')
  .action((root: string, options: BuildOpts) => {
    build({
      root,
      configFile: options.configFile,
    });
  });

  program
  .command("dev")
  .description("start dev server")
  .argument("[root]", "project path")
  .option('-c, --config [configFile]', 'config file')
  .action((root: string, options: BuildOpts) => {
    dev({
      root,
      configFile: options.configFile,
    });
  });
program.parse();
