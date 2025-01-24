import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { Verses_fts } from "../classes/Verses_fts";
import { Verses } from "../classes/Verses";
import { Books } from "../classes/Books";

export const apiRoutes = new Hono();
const db = new Database("bible.db", { create: true });

apiRoutes.get("/search", async (c) => {
  const LIMIT = 40;
  const term = c.req.query("q") ?? "";
  console.log(term);
  const text = String(term)?.trim().split(" ").join(" OR ");

  let query: string;
  let WHERE = "";

  // Regular expression to match format "John 3"
  const matchChapter = term.match(/(\w+)\s+(\d+)/);
  // Regular expression to match both formats: "John 3:16" and "John 3 16"
  const matchVerse = term.match(/(\w+)\s+(\d+)(?::|\s+)(\d+)?/);

  if (matchVerse) {
    const [, bookName, chapter, verse] = matchVerse;
    // Override the query to search for verses in the specified book name, chapter, and verse
    WHERE = `Verses_fts MATCH 'bookName:${bookName}*' AND chapter=${chapter} AND verse=${verse}`;
    query = `
    SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE ${WHERE}
      ORDER BY score
      LIMIT ?;
    `;
  } else if (matchChapter) {
    const [, bookName, chapter] = matchChapter;
    // Override the query to search for verses in the specified book name and chapter
    WHERE = `Verses_fts MATCH 'bookName:${bookName}*' AND chapter=${chapter}`;
    query = `
    SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE ${WHERE}
      ORDER BY bookName, verse;
    `;
  } else {
    WHERE = `Verses_fts MATCH '${text}*'`;
    query = `
      SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE ${WHERE}
      ORDER BY score
      LIMIT ?;
    `;
  }

  const statement = db.query(query).as(Verses_fts);
  const verses = statement.all(LIMIT);
  const countQuery = `SELECT COUNT(*) as count FROM Verses_fts  WHERE ${WHERE}`;
  const countStatement = db.query(countQuery);
  const count = countStatement.get() as { count: number };
  return c.json({ ...count, verses });
});

// Route for all books:
apiRoutes.get("/books", async (c) => {
  const statement = db.query("SELECT * FROM Books").as(Books);
  const books = statement.all();
  return c.json(books);
});

// Route for books of a specific translation:
apiRoutes.get("/books/:translation", async (c) => {
  const translation = c.req.param("translation");
  const query = `SELECT * FROM Books WHERE translation = '${translation}'`;
  const statement = db.query(query).as(Books);
  const books = statement.all();
  return c.json(books);
});

// route to get read books
apiRoutes.get("/verses", async (c) => {
  const { bookUsfm, chapter, translation } = c.req.queries();
  const query = `SELECT * FROM Verses 
      WHERE translation = '${translation}'
      AND bookUsfm = '${bookUsfm}'
      AND chapter = '${chapter}'
    `;
  const statement = db.query(query).as(Verses);
  const verses = statement.all();
  return c.json(verses);
});
