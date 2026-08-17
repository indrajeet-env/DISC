import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corpusPath = path.join(
  __dirname,
  "../../data/procurement_corpus.md"
);

let cachedSections = null;

const loadCorpus = async () => {
  if (cachedSections) return cachedSections;

  const corpus = await fs.readFile(corpusPath, "utf8");

  cachedSections = corpus
    .split(/\n---+\n/)
    .map(section => section.trim())
    .filter(Boolean);

  return cachedSections;
};

export const searchProcurementCorpus = async (query) => {
  const sections = await loadCorpus();

  const words = String(query)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length >= 3);

  const results = sections
    .map(section => {
      const text = section.toLowerCase();

      const score = words.reduce(
        (total, word) => total + (text.includes(word) ? 1 : 0),
        0
      );

      return { section, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return results.map(result => result.section);
};