import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  publicPath: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

// Keep public assets at the site root, matching the absolute URLs used by
// the React components (for example, /logo.png and /smiley.png).
const publicDir = path.join(process.cwd(), "public");
for await (const assetPath of new Bun.Glob("**/*").scan({ cwd: publicDir, onlyFiles: true })) {
  const sourcePath = path.join(publicDir, assetPath);
  const destinationPath = path.join(outdir, assetPath);
  await Bun.write(destinationPath, Bun.file(sourcePath));
  console.log(` ${path.relative(process.cwd(), destinationPath)}`);
}
