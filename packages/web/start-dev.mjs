import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);
process.argv = [process.argv[0], "dev", "--port", "3000"];
await import("next/dist/bin/next.js");
