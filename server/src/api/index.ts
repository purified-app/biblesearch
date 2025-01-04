import { Database } from "bun:sqlite";
import { Hono } from "hono";

export const apiRoutes = new Hono();
const db = new Database("bible.db", { create: true });

apiRoutes.get("/search", async (c) => {
  const term = c.req.query("q") ?? "";
  const text = String(term)?.trim().split(" ").join(" OR ");
  console.time("search");
  console.log(term);
  let query = `
      SELECT *, bm25(Verses_fts, 0, 10, 0, 2, 1, 15) as score
      FROM Verses_fts 
      WHERE Verses_fts MATCH '${text}*' 
      ORDER BY score
      LIMIT 7
    `;

  // Regular expression to match both formats: "John 3:16" and "John 3 16"
  const match = term.match(/(\w+)\s+(\d+)(?::|\s+)(\d+)?/);
  if (match) {
    const [, bookName, chapter, verse] = match;
    // Override the query to search for verses in the specified book name, chapter, and verse
    query = `
    SELECT *, bm25(Verses_fts, 0, 2, 0, 1, 1, 0) as score
      FROM Verses_fts 
      WHERE Verses_fts MATCH 'book_name:${bookName}* AND chapter:${chapter} AND verse:${verse}'
      ORDER BY score
      LIMIT 7;
    `;
  }

  const results = db.query(query);

  console.timeEnd("search");
  try {
    return c.json(results.all());
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    return c.json(null);
  }
});

// route to get read books
apiRoutes.get("/verses", async (c) => {
  const { book, chapter } = c.req.queries();
  const results = db.query(
    `SELECT * FROM Verses WHERE book = '${book}' AND chapter = '${chapter}'`
  );
  try {
    return c.json(results.all());
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    return c.json(null);
  }
});
