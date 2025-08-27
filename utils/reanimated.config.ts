
export const reanimatedConfig = {
  strict: false,
  level: "warn",
};

if (typeof global !== "undefined") {

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      message.includes("Reading from `value` during component render")
    ) {
      return;
    }
    if (
      typeof message === "string" &&
      message.includes("get method of a shared value while React is rendering")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export default reanimatedConfig;
