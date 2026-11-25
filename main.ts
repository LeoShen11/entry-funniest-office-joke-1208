// The Funniest Office Joke, Judged Head to Head
// Writes one single-line office joke to /output/entry.txt
// (or to a path given as the first argument, for local testing).
//
// The joke: a setup (asking HR for a raise), a turn (getting a
// mindfulness app instead of money), and the punchline last —
// calmly watching the salary stay exactly where it is.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const JOKE =
  "I asked HR for a raise and they gave me a mindfulness app \u2014 now I can calmly watch my salary stay exactly where it is.";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// An optional first argument overrides the output file, so the
// entry can be run and checked anywhere without touching /output:
//   node main.ts ./entry.txt
// With no argument the harness path /output/entry.txt is used.
const outputFile = process.argv[2]
  ? resolve(process.argv[2])
  : OUTPUT_FILE;

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space, on a single line.
function validate(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    problems.push(`length is ${chars.length} characters, must be 1-200`);
  }
  if (text.trim().length === 0) {
    problems.push("text is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("text must be a single line");
  }
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 5) {
    problems.push(`only ${words.length} words, a real joke needs more`);
  }
  if (text !== text.trim()) {
    problems.push("text has leading or trailing white space");
  }
  return problems;
}

const problems = validate(JOKE);
if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`invalid joke: ${problem}`);
  }
  process.exit(1);
}

// A failed write used to die with a raw stack trace; report it
// plainly instead, so a bad output path is diagnosable at a glance.
try {
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, JOKE, "utf8");
} catch (error) {
  console.error(
    `cannot write ${outputFile}: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
}

// Read-back check: the file on disk must be byte-for-byte the
// joke we validated, with nothing added (no trailing newline).
const written = readFileSync(outputFile, "utf8");
if (written !== JOKE) {
  console.error("read-back mismatch: entry.txt does not match the joke");
  process.exit(1);
}
const readBackProblems = validate(written);
if (readBackProblems.length > 0) {
  for (const problem of readBackProblems) {
    console.error(`read-back invalid: ${problem}`);
  }
  process.exit(1);
}

console.log(
  `wrote ${[...written].length} characters, ${written.trim().split(/\s+/).length} words to ${outputFile}`,
);
console.log(written);
