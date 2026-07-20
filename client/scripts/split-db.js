import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const sourcePath = join(import.meta.dir, "../database/bible.db");
const outputDir = join(import.meta.dir, "../src/assets/databases");

if (!existsSync(sourcePath)) {
  throw new Error(`Database not found: ${sourcePath}`);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const source = new Database(sourcePath, { readonly: true });
const translations = source
  .query("SELECT DISTINCT translation FROM Verses")
  .all()
  .map(({ translation }) => translation);
source.close();

for (const translation of translations) {
  const outputPath = join(outputDir, `${translation}.db`);
  const database = new Database(outputPath);
  database.run("ATTACH DATABASE ? AS source", [sourcePath]);
  database.run("PRAGMA journal_mode = OFF");
  database.run("PRAGMA synchronous = OFF");

  database.run(`
    CREATE TABLE Books (
      id INTEGER PRIMARY KEY,
      name TEXT,
      abbreviation TEXT,
      bookNumber INTEGER,
      chapters INTEGER,
      usfm TEXT,
      canon TEXT,
      translation TEXT
    );
    CREATE TABLE Verses (
      id INTEGER PRIMARY KEY,
      bookName TEXT,
      bookNumber INTEGER,
      chapter INTEGER,
      text TEXT,
      translation TEXT,
      verse INTEGER,
      bookUsfm TEXT,
      canon TEXT
    );
    CREATE VIRTUAL TABLE Verses_fts USING fts5(
      bookName, bookNumber, chapter, text, translation, verse, bookUsfm, canon,
      content='Verses', content_rowid='id'
    );
  `);

  database.run(`
    INSERT INTO Books
    SELECT * FROM source.Books WHERE translation = ?
  `, [translation]);
  database.run(`
    INSERT INTO Verses
    SELECT * FROM source.Verses WHERE translation = ?
  `, [translation]);
  database.run("INSERT INTO Verses_fts(Verses_fts) VALUES('rebuild')");
  database.run("DETACH DATABASE source");
  database.run("VACUUM");
  database.close();

  const sizeMb = (statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`${translation}.db (${sizeMb} MB)`);
}
