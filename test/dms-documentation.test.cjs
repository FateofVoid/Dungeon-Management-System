const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.state = {};
global.storyCards = [];
global.history = [];
global.info = { actionCount: 0, maxChars: 12000 };
global.log = () => {};
global.text = "";
global.stop = false;

const ROOT = path.resolve(__dirname, "..");
const DMS = require("../Library.js");
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory() && ![".git", "node_modules"].includes(entry.name)) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
  });
}

test("documentation identifies the current DMS version and verified Tier boundary", () => {
  assert.equal(DMS.DMS_VERSION, packageJson.version);
  const documents = [read("README.md"), read("docs/DEVELOPMENT_GUIDE.md"), read("docs/PLAYER_TUTORIAL.md")];
  for (const document of documents) {
    assert.match(document, new RegExp(DMS.DMS_VERSION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(document, new RegExp(`0[–-]${DMS.VERIFIED_DUNGEON_TIER}`));
    assert.match(document, new RegExp(`Tier ${DMS.VERIFIED_DUNGEON_TIER + 1}.*(?:seal|gate)`, "is"));
  }
});

test("every player tutorial System example is recognized by natural routing", () => {
  const tutorial = read("docs/PLAYER_TUTORIAL.md");
  const requests = [...tutorial.matchAll(/^>\s+(System,.*)$/gm)].map(match => match[1]);
  assert.ok(requests.length >= 25, "The player tutorial should retain a detailed natural-language path.");
  assert.doesNotMatch(tutorial, /^>\s*\/dms\b/gm, "Normal tutorial play must not require slash commands.");
  for (const request of requests) assert.ok(DMS.naturalSystemCommand(request), `Unrecognized tutorial request: ${request}`);
});

test("relative Markdown documentation links resolve", () => {
  const failures = [];
  for (const file of markdownFiles(ROOT)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const rawTarget = match[1].trim();
      if (/^(?:https?:|mailto:|#)/i.test(rawTarget)) continue;
      const localTarget = decodeURIComponent(rawTarget.split("#")[0]);
      if (!localTarget) continue;
      const resolved = path.resolve(path.dirname(file), localTarget);
      if (!fs.existsSync(resolved)) failures.push(`${path.relative(ROOT, file)} -> ${rawTarget}`);
    }
  }
  assert.deepEqual(failures, []);
});
