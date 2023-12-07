import { App as AppCore, AppOpts as AppCoreOpts } from "@zfast/core";
import path from "path";

interface AppOpts extends AppCoreOpts {}

class App extends AppCore {
  hasJsxRuntime: boolean;
  constructor(props: AppOpts) {
    super(props);
    this.hasJsxRuntime = (() => {
      if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
        return false;
      }
      try {
        require.resolve("react/jsx-runtime");
        return true;
      } catch (e) {
        return false;
      }
    })();
  }

  getEntry() {
    return {
      main: path.join(this.cwd, "src/index"),
    };
  }
}

export default App;
