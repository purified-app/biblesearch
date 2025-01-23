import { Database } from "bun:sqlite";
import { Hono } from "hono";

export const apiRoutes = new Hono();
const db = new Database("bible.db", { create: true });

apiRoutes.get("/search", async (c) => {
  const LIMIT = 24;
  const term = c.req.query("q") ?? "";
  console.log(term);
  const text = String(term)?.trim().split(" ").join(" OR ");
  let query = `
      SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE Verses_fts MATCH '${text}*' 
      ORDER BY score
      LIMIT ${LIMIT};
    `;

  // Regular expression to match format "John 3"
  const matchChapter = term.match(/(\w+)\s+(\d+)/);
  // Regular expression to match both formats: "John 3:16" and "John 3 16"
  const matchVerse = term.match(/(\w+)\s+(\d+)(?::|\s+)(\d+)?/);

  if (matchChapter) {
    const [, bookName, chapter] = matchChapter;
    console.log(bookName, chapter);
    // Override the query to search for verses in the specified book name and chapter
    query = `
    SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE Verses_fts MATCH 'bookName:${bookName}*' AND chapter=${chapter}
      ORDER BY bookName, verse;
    `;
  }
  if (matchVerse) {
    const [, bookName, chapter, verse] = matchVerse;
    // Override the query to search for verses in the specified book name, chapter, and verse
    query = `
    SELECT *, bm25(Verses_fts, 20, 0, 10, 15, 4, 5, 10, 2) as score
      FROM Verses_fts 
      WHERE Verses_fts MATCH 'bookName:${bookName}* AND chapter:${chapter} AND verse:${verse}'
      ORDER BY score
      LIMIT ${LIMIT};
    `;
  }

  const results = db.query(query);
  try {
    return c.json(results.all());
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    return c.json(null);
  }
});

// route to get read books
apiRoutes.get("/verses", async (c) => {
  const { bookUsfm, chapter, translation } = c.req.queries();
  const results = db.query(
    `SELECT * FROM Verses 
      WHERE translation = '${translation}'
      AND bookUsfm = '${bookUsfm}'
      AND chapter = '${chapter}'
    `
  );
  try {
    const verses = results.all();
    const verse = verses[0] as { book_name: string; chapter: number };
    if (verse) {
      console.log(verse.book_name, verse.chapter);
    }
    return c.json(verses);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    return c.json(null);
  }
});
