import fs from "fs-extra";
import { findWorkspacePackages } from "@pnpm/workspace.find-packages";
import { resolve } from "path";


(async () => {
  const cwd = process.cwd();
  const packages = await findWorkspacePackages(cwd);
  console.log('remove dirs...');
  packages.forEach((pkg) => {
    ["dist", "node_modules"].forEach((name) => {
      fs.remove(resolve(cwd, pkg.dir, name));
    });
  });
  console.log('remove done');
})();
