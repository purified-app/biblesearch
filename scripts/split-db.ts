import { Database } from "bun:sqlite";
import { join } from "node:path";
import {
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
} from "node:fs";

const originalDbPath = join(import.meta.dir, "../database/bible.db");
const outputDir = join(import.meta.dir, "../src/assets/databases");

console.log(`📂 Original database: ${originalDbPath}`);
console.log(`📂 Output directory: ${outputDir}`);

if (!existsSync(originalDbPath)) {
  console.error("❌ Original database not found!");
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const mainDb = new Database(originalDbPath, { readonly: true });
const translations = mainDb
  .query<{ translation: string }, []>("SELECT DISTINCT translation FROM Verses")
  .all()
  .map(({ translation }) => translation);
mainDb.close();

console.log(`📌 Found translations: ${translations.join(", ")}`);

for (const trans of translations) {
  const targetDbPath = join(outputDir, `${trans}.db`);
  console.log(`\n========================================`);
  console.log(`🔨 Splitting translation: ${trans} -> ${targetDbPath}`);

  const targetDb = new Database(targetDbPath);
  targetDb.run("ATTACH DATABASE ? AS source", [originalDbPath]);

  // Configure for size and static read-only use
  targetDb.run("PRAGMA journal_mode = OFF;");
  targetDb.run("PRAGMA synchronous = OFF;");

  // Create Books table
  targetDb.run(`
    CREATE TABLE "Books" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      abbreviation TEXT,
      bookNumber INTEGER,
      chapters INTEGER,
      usfm TEXT,
      canon TEXT,
      translation TEXT
    );
  `);

  // Create Verses table
  targetDb.run(`
    CREATE TABLE "Verses" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookName TEXT,
      bookNumber INTEGER,
      chapter INTEGER,
      text TEXT,
      translation TEXT,
      verse INTEGER,
      bookUsfm TEXT,
      canon TEXT
    );
  `);

  targetDb.run(`
    INSERT INTO Books (id, name, abbreviation, bookNumber, chapters, usfm, canon, translation)
    SELECT id, name, abbreviation, bookNumber, chapters, usfm, canon, translation
    FROM source.Books
    WHERE translation = ?
  `, [trans]);

  targetDb.run(`
    INSERT INTO Verses (id, bookName, bookNumber, chapter, text, translation, verse, bookUsfm, canon)
    SELECT id, bookName, bookNumber, chapter, text, translation, verse, bookUsfm, canon
    FROM source.Verses
    WHERE translation = ?
  `, [trans]);

  console.log("⚡ Building FTS5 virtual table...");
  targetDb.run(`
    CREATE VIRTUAL TABLE "Verses_fts" USING fts5(
        bookName, 
        bookNumber, 
        chapter, 
        text, 
        translation,
        verse, 
        bookUsfm, 
        canon,
        content='Verses',
        content_rowid='id'
    );
  `);

  // Build FTS index
  console.log("⚡ Indexing text search (FTS rebuild)...");
  targetDb.run("INSERT INTO Verses_fts(Verses_fts) VALUES('rebuild');");
  targetDb.run("DETACH DATABASE source");

  // Perform VACUUM to reclaim space and minimize file size
  console.log("🧹 Compacting and vacuuming DB...");
  targetDb.run("VACUUM;");

  targetDb.close();

  const stats = statSync(targetDbPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Successfully generated ${trans}.db (${sizeMb} MB)`);
}

console.log("\n🎉 All translations successfully split and saved in client/src/assets/databases!");
