import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !["node_modules", ".next"].includes(ent.name)) {
      walk(p, files);
    } else if (ent.isFile() && ent.name.endsWith(".tsx")) {
      files.push(p);
    }
  }
  return files;
}

const replacements = [
  [
    /\{error && <p className="text-sm text-red-400">\{error\}<\/p>\}/g,
    "<FormError message={error} />",
  ],
  [
    /\{error && <p className="text-xs text-red-400">\{error\}<\/p>\}/g,
    '<FormError message={error} size="sm" />',
  ],
  [
    /\{createError && <p className="text-sm text-red-400">\{createError\}<\/p>\}/g,
    "<FormError message={createError} />",
  ],
  [
    /\{editError && <p className="text-sm text-red-400">\{editError\}<\/p>\}/g,
    "<FormError message={editError} />",
  ],
  [
    /\{success && <p className="text-sm text-emerald-400">\{success\}<\/p>\}/g,
    "<FormSuccess message={success} />",
  ],
];

const importLine =
  "import { FormError, FormSuccess } from '@/components/ui/form-error';\n";

let changed = 0;
for (const file of walk("components").filter((f) => !f.includes("form-error.tsx"))) {
  let src = fs.readFileSync(file, "utf8");
  let next = src;
  for (const [re, rep] of replacements) {
    next = next.replace(re, rep);
  }
  if (next !== src) {
    if (
      (next.includes("<FormError") || next.includes("<FormSuccess")) &&
      !next.includes("@/components/ui/form-error")
    ) {
      const idx = next.indexOf("\n") + 1;
      next = next.slice(0, idx) + importLine + next.slice(idx);
    }
    fs.writeFileSync(file, next);
    changed++;
  }
}

console.log(`Updated ${changed} files`);
