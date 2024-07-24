import type { Config } from "tailwindcss";
import sharedConfig from "@dub/tailwind-config/tailwind.config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./src/app/**/*.tsx"],
  presets: [sharedConfig],
};

export default config;
