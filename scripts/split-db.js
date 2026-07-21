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
      bookNumber INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      abbreviation TEXT,
      chapters INTEGER NOT NULL,
      usfm TEXT NOT NULL UNIQUE,
      canon TEXT NOT NULL,
      translation TEXT NOT NULL
    );
    CREATE TABLE Verses (
      id INTEGER PRIMARY KEY,
      bookNumber INTEGER NOT NULL REFERENCES Books(bookNumber),
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE (bookNumber, chapter, verse)
    );
    CREATE VIRTUAL TABLE Verses_fts USING fts5(
      text,
      content='Verses', content_rowid='id'
    );
    CREATE VIEW v_Verses AS
      SELECT
        v.id,
        b.name AS bookName,
        v.bookNumber,
        v.chapter,
        v.text,
        b.translation,
        v.verse,
        b.usfm AS bookUsfm,
        b.canon
      FROM Verses AS v
      JOIN Books AS b ON b.bookNumber = v.bookNumber;
  `);

  database.run(`
    INSERT INTO Books (bookNumber, name, abbreviation, chapters, usfm, canon, translation)
    SELECT bookNumber, name, abbreviation, chapters, usfm, canon, translation
    FROM source.Books
    WHERE translation = ?
  `, [translation]);
  database.run(`
    INSERT INTO Verses (id, bookNumber, chapter, verse, text)
    SELECT id, bookNumber, chapter, verse, text
    FROM source.Verses
    WHERE translation = ?
  `, [translation]);
  database.run("INSERT INTO Verses_fts(Verses_fts) VALUES('rebuild')");
  database.run("DETACH DATABASE source");
  database.run("VACUUM");
  database.close();

  const sizeMb = (statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`${translation}.db (${sizeMb} MB)`);
}
