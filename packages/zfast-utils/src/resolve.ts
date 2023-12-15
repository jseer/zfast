import resolve from "resolve";

export async function resolveAsync(name: string, opts: resolve.AsyncOpts = {}) {
  return new Promise((r, j) => {
    resolve(name, opts, function (err, resolved) {
      if (err) {
        return j(err);
      }
      r(resolved);
    });
  });
}
