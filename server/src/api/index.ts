import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { join } from "path";
import { Verses_fts } from "../classes/Verses_fts";
import { Verses } from "../classes/Verses";
import { Books } from "../classes/Books";

export const apiRoutes = new Hono();

// Resolve db path stably using import.meta.dir
const dbPath = process.env.DB_PATH || join(import.meta.dir, "../../database/bible.db");
const db = new Database(dbPath);

// Enable WAL for excellent concurrent read performance
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");
db.run("PRAGMA cache_size = -20000;"); // ~20MB cache

function normalizeBookSearch(bookName: string): [string, string, string] {
  const clean = bookName.trim().toLowerCase();
  
  if (clean.startsWith("1 ") || clean.startsWith("1st ") || clean.startsWith("i ")) {
    const root = clean.replace(/^(1st\s+|1\s+|i\s+)/, "");
    return [`1 ${root}%`, `I ${root}%`, `1JN%`];
  }
  if (clean.startsWith("2 ") || clean.startsWith("2nd ") || clean.startsWith("ii ")) {
    const root = clean.replace(/^(2nd\s+|2\s+|ii\s+)/, "");
    return [`2 ${root}%`, `II ${root}%`, `2JN%`];
  }
  if (clean.startsWith("3 ") || clean.startsWith("3rd ") || clean.startsWith("iii ")) {
    const root = clean.replace(/^(3rd\s+|3\s+|iii\s+)/, "");
    return [`3 ${root}%`, `III ${root}%`, `3JN%`];
  }
  return [`${bookName}%`, `${bookName}%`, `${bookName}%`];
}

function buildFtsQuery(term: string, useOr = false): string {
  // Regex to match double-quoted phrases, or individual words.
  const regex = /"[^"]+"|\S+/g;
  const tokens = term.match(regex) || [];
  
  const processed = tokens.map(token => {
    if (token.startsWith('"') && token.endsWith('"')) {
      // It is a quoted phrase. Clean up weird characters but keep word spacing
      const inner = token.slice(1, -1).trim().replace(/[^\p{L}\p{N}\s_]/gu, " ").replace(/\s+/g, " ");
      if (inner) {
        return `"${inner}"`;
      }
      return "";
    } else {
      // Single word. Clean everything except alphanumeric
      const clean = token.replace(/[^\p{L}\p{N}_]/gu, "");
      if (clean) {
        // If length >= 3, append prefix wildcard *
        return clean.length >= 3 ? `${clean}*` : clean;
      }
      return "";
    }
  }).filter(Boolean);

  if (processed.length === 0) return "";
  
  const delimiter = useOr ? " OR " : " ";
  return `text : (${processed.join(delimiter)})`;
}

apiRoutes.get("/search", async (c) => {
  const LIMIT = 120;
  const term = (c.req.query("query") || "").trim();
  const canonFilter = c.req.query("canon"); // 'nt' or 'ot'
  const booksFilter = c.req.query("books"); // Comma-separated list of book USFM
  const translationsFilter = c.req.query("translations"); // Comma-separated list

  const whereClauses: string[] = [];
  const queryParams: (string | number)[] = [];

  // 1. Build WHERE clauses based on filters
  if (canonFilter) {
    whereClauses.push("canon = ?");
    queryParams.push(canonFilter);
  }

  if (booksFilter) {
    const books = booksFilter.split(",").map(b => b.trim()).filter(Boolean);
    if (books.length > 0) {
      const placeholders = books.map(() => "?").join(",");
      whereClauses.push(`bookUsfm IN (${placeholders})`);
      books.forEach((book) => queryParams.push(book));
    }
  }

  if (translationsFilter) {
    const translations = translationsFilter.split(",").map(t => t.trim()).filter(Boolean);
    if (translations.length > 0) {
      const placeholders = translations.map(() => "?").join(",");
      whereClauses.push(`translation IN (${placeholders})`);
      translations.forEach((translation) => queryParams.push(translation));
    }
  }

  // 2. Parse search term with precise regex matcher (supports multi-word books like "I John", "1 John")
  const matchBookChapterVerse = term.match(/^(.*?)\s+(\d+)(?::|\s+)(\d+)$/);
  const matchChapterVerseOnly = term.match(/^(\d+):(\d+)$/);
  const matchChapter = term.match(/^(.*?)\s+(\d+)$/);

  // Initialize query structure settings
  let tableName = "Verses_fts";
  let selectClause = "*";
  let orderByClause = "score";
  let isStructuredParsed = false;

  if (matchBookChapterVerse) {
    const [, bookName, chapter, verse] = matchBookChapterVerse;
    const [v1, v2, v3] = normalizeBookSearch(bookName);
    const bookCheck = db.query(
      "SELECT COUNT(*) as count FROM Books WHERE (name LIKE ? OR name LIKE ? OR usfm LIKE ?)"
    ).get(v1, v2, v3) as { count: number } | null;

    if (bookCheck && bookCheck.count > 0) {
      whereClauses.push("(bookName LIKE ? OR bookName LIKE ? OR bookUsfm LIKE ?)");
      whereClauses.push("chapter = ?");
      whereClauses.push("verse = ?");
      queryParams.push(v1, v2, v3, Number(chapter), Number(verse));
      
      tableName = "Verses";
      selectClause = "*";
      orderByClause = "bookNumber, chapter, verse";
      isStructuredParsed = true;
    }
  } else if (matchChapter) {
    const [, bookName, chapter] = matchChapter;
    const [v1, v2, v3] = normalizeBookSearch(bookName);
    const bookCheck = db.query(
      "SELECT COUNT(*) as count FROM Books WHERE (name LIKE ? OR name LIKE ? OR usfm LIKE ?)"
    ).get(v1, v2, v3) as { count: number } | null;

    if (bookCheck && bookCheck.count > 0) {
      whereClauses.push("(bookName LIKE ? OR bookName LIKE ? OR bookUsfm LIKE ?)");
      whereClauses.push("chapter = ?");
      queryParams.push(v1, v2, v3, Number(chapter));

      tableName = "Verses";
      selectClause = "*";
      orderByClause = "bookNumber, chapter, verse";
      isStructuredParsed = true;
    }
  }

  if (!isStructuredParsed && matchChapterVerseOnly) {
    const [, chapter, verse] = matchChapterVerseOnly;
    whereClauses.push("chapter = ?");
    whereClauses.push("verse = ?");
    queryParams.push(Number(chapter), Number(verse));
    tableName = "Verses";
    selectClause = "*";
    orderByClause = "bookNumber, chapter, verse";
    isStructuredParsed = true;
  }

  // Fallback to standard term search if no structured target was matched
  if (!isStructuredParsed) {
    const ftsQuery = buildFtsQuery(term, false);
    if (ftsQuery !== "") {
      whereClauses.push("Verses_fts MATCH ?");
      queryParams.push(ftsQuery);
      tableName = "Verses_fts";
      // Weight text column (index 3) to 1.0, everything else to 0.0
      selectClause = "*, bm25(Verses_fts, 0, 0, 0, 1.0, 0, 0, 0, 0) as score";
      orderByClause = "score";
    } else {
      // Return empty search if no term and no filters specified, or fall back safely
      if (whereClauses.length === 0) {
        return c.json({ count: 0, verses: [] });
      }
      tableName = "Verses";
      selectClause = "*";
      orderByClause = "bookNumber, chapter, verse";
    }
  }

  const WHERE = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // 3. Count Query execution
  const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${WHERE}`;
  const countStatement = db.query(countQuery);
  let countResult = countStatement.get(...queryParams) as { count: number } | null;
  let count = countResult?.count ?? 0;

  // Real-time FTS query correction logic (intelligent OR-based fallback for empty results)
  let actualQueryParams = [...queryParams];
  if (!isStructuredParsed && count === 0 && term.trim() !== "") {
    const tokens = term.match(/"[^"]+"|\S+/g) || [];
    if (tokens.length > 1) {
      const ftsOrQuery = buildFtsQuery(term, true);
      if (ftsOrQuery !== "") {
        const matchIndex = whereClauses.indexOf("Verses_fts MATCH ?");
        if (matchIndex !== -1) {
          const checkParams = [...queryParams];
          checkParams[matchIndex] = ftsOrQuery;

          const checkCountResult = countStatement.get(...checkParams) as { count: number } | null;
          const checkCount = checkCountResult?.count ?? 0;
          if (checkCount > 0) {
            count = checkCount;
            actualQueryParams = checkParams;
          }
        }
      }
    }
  }

  // 4. Main Query execution
  const mainQuery = `
    SELECT ${selectClause}
    FROM ${tableName}
    ${WHERE}
    ORDER BY ${orderByClause}
    LIMIT ?;
  `;
  const statement = db.query(mainQuery);
  if (tableName === "Verses") {
    statement.as(Verses);
  } else {
    statement.as(Verses_fts);
  }

  const verses = statement.all(...actualQueryParams, LIMIT);

  return c.json({ count, verses });
});

// Route for all books:
apiRoutes.get("/books", async (c) => {
  const statement = db.query("SELECT * FROM Books").as(Books);
  return c.json(statement.all());
});

// Route for books of a specific translation:
apiRoutes.get("/books/:translation", async (c) => {
  const translation = c.req.param("translation");
  const statement = db.query("SELECT * FROM Books WHERE translation = ?").as(Books);
  return c.json(statement.all(translation));
});

// Route to get verses of a chapter:
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

  const statement = db
    .query("SELECT * FROM Verses WHERE translation = ? AND bookUsfm = ? AND chapter = ?")
    .as(Verses);

  return c.json(statement.all(translation, bookUsfm, Number(chapter)));
});
