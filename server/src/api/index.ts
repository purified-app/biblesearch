import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { Verses_fts } from "../classes/Verses_fts";
import { Verses } from "../classes/Verses";
import { Books } from "../classes/Books";

export const apiRoutes = new Hono();
const db = new Database("bible.db", { create: true });

// server.ts
apiRoutes.get("/search", async (c) => {
  const LIMIT = 120;
  const term = c.req.query("query") ?? "";
  const canonFilter = c.req.query("canon"); // 'nt' or 'ot'
  const booksFilter = c.req.query("books"); // Comma-separated list of book USFM
  const translationsFilter = c.req.query("translations"); // Comma-separated list

  const text = String(term)?.trim().split(" ").join(" OR ");

  let query: string;
  let WHERE = "";
  const queryParams: (string | number)[] = []; // To hold parameters for the query

  // 1. Build WHERE clause based on filters

  const whereClauses: string[] = [];

  // Canon filter
  if (canonFilter) {
    whereClauses.push(`canon = ?`);
    queryParams.push(canonFilter);
  }

  // Books filter (using bookUsfm)
  if (booksFilter) {
    const books = booksFilter.split(",");
    if (books.length > 0) {
      const bookPlaceholders = books.map(() => "?").join(",");
      whereClauses.push(`bookUsfm IN (${bookPlaceholders})`); // Changed to bookUsfm
      books.forEach((book) => queryParams.push(book));
    }
  }

  // Translations filter
  if (translationsFilter) {
    const translations = translationsFilter.split(",");
    if (translations.length > 0) {
      const translationPlaceholders = translations.map(() => "?").join(",");
      whereClauses.push(`translation IN (${translationPlaceholders})`);
      translations.forEach((translation) => queryParams.push(translation));
    }
  }

  // Regular expression to match format "John 3"
  const matchChapter = term.match(/(\w+)\s+(\d+)/);
  // Regular expression to match formats: "John 3:16", "John 3 16"
  const matchBookChapterVerse = term.match(/^(\w+)\s+(\d+)(?::|\s+)(\d+)$/);
  // Regular expression to match "chapter:verse" only
  const matchChapterVerseOnly = term.match(/^(\d+):(\d+)$/);

  if (matchBookChapterVerse) {
    const [, bookName, chapter, verse] = matchBookChapterVerse;
    whereClauses.push(
      `Verses_fts MATCH 'bookName:${bookName}*' AND chapter=${chapter} AND verse=${verse}`
    );
  } else if (matchChapterVerseOnly) {
    const [, chapter, verse] = matchChapterVerseOnly;
    whereClauses.push(`chapter=${chapter} AND verse=${verse}`);
  } else if (matchChapter) {
    const [, bookName, chapter] = matchChapter;
    whereClauses.push(`Verses_fts MATCH 'bookName:${bookName}*' AND chapter=${chapter}`);
  } else if (text) {
    whereClauses.push(`Verses_fts MATCH '${text}*'`);
  }

  if (whereClauses.length > 0) {
    WHERE = "WHERE " + whereClauses.join(" AND ");
  }

  // 2. Construct the main query
  let selectClause = "*";
  let orderByClause = "score";

  if (matchChapter) {
    selectClause = "*, bm25(Verses_fts, 20, 0, 15, 10, 5, 15, 20, 5) as score";
    orderByClause = "bookName, verse";
  } else if (!matchChapterVerseOnly) {
    selectClause = "*, bm25(Verses_fts, 20, 0, 15, 10, 5, 15, 20, 5) as score";
    orderByClause = "score";
  } else {
    orderByClause = "bookNumber"; // default order
  }

  const tableName = matchChapterVerseOnly ? "Verses" : "Verses_fts"; // change table

  query = `
   SELECT ${selectClause}
   FROM ${tableName}
   ${WHERE}
   ORDER BY ${orderByClause}
   LIMIT ?;
   `;

  queryParams.push(LIMIT); // Add LIMIT to query parameters

  const statement = db.query(query).as(Verses_fts);
  const verses = statement.all(...queryParams); // Pass parameters to all()

  // 3. Count query

  const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${WHERE}`;
  const countStatement = db.query(countQuery);
  const count = countStatement.get(...queryParams.slice(0, -1)) as {
    count: number;
  }; // Remove LIMIT from count query
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
  const query = `SELECT * FROM Books WHERE translation = ?`;
  const statement = db.query(query).as(Books);
  const books = statement.all(translation);
  return c.json(books);
});

// route to get read books
apiRoutes.get("/verses", async (c) => {
  const bookUsfm = c.req.query("bookUsfm");
  const chapter = c.req.query("chapter");
  const translation = c.req.query("translation");
  if (!bookUsfm || !chapter || !translation) {
    return c.json(
      { error: "Missing required query parameters: bookUsfm, chapter, translation" },
      400
    );
  }
  const query = `SELECT * FROM Verses WHERE translation = ? AND bookUsfm = ? AND chapter = ?`;
  const statement = db.query(query).as(Verses);
  const verses = statement.all(translation, bookUsfm, chapter);
  return c.json(verses);
});
