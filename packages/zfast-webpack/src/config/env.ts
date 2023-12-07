function getClientEnvironment(publicUrl: string) {
  const raw = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PUBLIC_URL: publicUrl,
    FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
  } as any;
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {} as any),
  };

  return { raw, stringified };
}

export default getClientEnvironment;
