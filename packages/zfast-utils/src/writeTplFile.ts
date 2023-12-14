import path from "path";
import fs from "fs-extra";
import Mustache from "mustache";
import assert from "assert";
import createDebugger from "./createDebugger";

export interface WriteFileOptions {
  outputPath: string;
  content?: string;
  tpl?: string;
  tplPath?: string;
  context?: object;
  transform?: (content: string) => Promise<string>;
}
const debug = createDebugger("utils:writeTplFile");
async function write(outputPath: string, content: string) {
  debug("write outputPath:%s ", outputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content, "utf-8");
}
export default async function writeTplFile(options: WriteFileOptions) {
  let { outputPath, content, tpl, tplPath, context, transform } = options;
  debug("outputPath:%s tplPath:%s", outputPath, tplPath);
  const savePath = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);
  if (!content) {
    assert(
      !tplPath ||
        (fs.existsSync(tplPath) && (await fs.stat(tplPath)).isFile()),
      `tplPath does not exists or is not a file.`
    );
    tpl = tplPath ? await fs.readFile(tplPath, "utf-8") : tpl;
    assert(tpl, `tpl or .tplPath must be supplied.`);
    content = Mustache.render(tpl, context);
  }
  if (transform) {
    content = await transform(content);
  }
  if (!fs.existsSync(savePath)) {
    await write(savePath, content);
  } else {
    const stats = await fs.stat(savePath);
    const buf = Buffer.from(content, "utf-8");
    if (
      !(
        stats.isFile() &&
        stats.size === buf.length &&
        (await fs.readFile(savePath)).equals(buf)
      )
    ) {
      await write(savePath, content);
    }
  }
}
