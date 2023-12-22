import fs from "fs-extra";
import { findWorkspacePackages } from "@pnpm/workspace.find-packages";
import { resolve } from "path";

(async () => {
  const cwd = process.cwd();
  const packages = await findWorkspacePackages(cwd);
  console.log("remove dirs...");
  await Promise.all(
    packages.map((pkg) =>
      Promise.all(
        ["dist", "node_modules"].map((name) =>
          fs.remove(resolve(cwd, pkg.dir, name))
        )
      )
    )
  );
  console.log("remove done");
})();
