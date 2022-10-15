import { readFile, readdir } from "fs/promises";
import { buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";
import express from "express";
import { readFileSync, writeFileSync } from "node:fs";
import * as Path from "path";
import * as Process from "process";
import cors from "cors";
import matter from "gray-matter";
import RSS from "rss";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeStringify from "rehype-stringify";
import remark2rehype from "remark-rehype";

type Note = {
  uri: string;
  title: string;
  date: Date;
  location: string;
  content: string | undefined;
};

let errNote = { uri: "404", title: "", date: "", content: "" };

async function loadNotes() {
  console.log("NODE_ENV is: " + String(process.env.NODE_ENV));
  const dir = Process.cwd() + "/assets/notes/";
  console.log("Notes Dir: " + dir);
  var tmp: Note[] = await readdir(dir)
    .then((file_array) => {
      file_array.filter((file) => Path.extname(file) === ".md");
      return file_array.map((file) => ({
        uri: Path.basename(file)
          .replace(".md", "")
          .replace(/\s/g, "_")
          .toLowerCase(),
        title: Path.basename(file).replace(".md", ""),
        date: new Date(2021),
        location: dir + file,
        content: undefined,
      }));
    })
    .catch((_) => {
      var n: Note[] = [];
      console.log("Error while loading directory.");
      return n;
    });

  tmp = await Promise.all(
    tmp.map(async (file) => {
      let front_matter: any = await readFile(file.location, "utf-8")
        .then((content) => {
          return matter(content);
        })
        .catch((_) => "Error while loading file.");
      if (typeof front_matter === "string") {
        file.content = front_matter;
      } else {
        if (!front_matter.isEmpty) {
          file.title = front_matter.data.title
            ? front_matter.data.title
            : file.title;
          file.date = front_matter.data.modified
            ? new Date(front_matter.data.modified)
            : file.date;
        }
        file.content = front_matter.content;
      }
      return file;
    })
  );
  return tmp;
}

// Starting the Server with loaded Notes.
async function init() {
  // Setup
  var notes: Note[] = await loadNotes()
    .then((value) => value)
    .catch((err: any) => {
      var n: Note[] = [];
      console.log("Failed to load notes.");
      return n;
    });

  // Schema (gives the types)
  // TODO: Change .build path for development
  var schema = buildSchema(
    readFileSync(Process.cwd() + "/build/schema.gql", "utf-8")
  );

  // Resolver (mappes js functions and schema types)
  var root = {
    getNote: (query: { uri: string }) => {
      let results = notes.filter((file) => file.uri === query.uri);
      if (results.length >= 1) {
        return {
          uri: results[0].uri,
          title: results[0]?.title,
          date: results[0].date.toDateString(),
          content: results[0]?.content,
        };
      } else {
        return { uri: "404", title: "", date: "", content: "" };
      }
    },
    getLatestNote: () => {
      return notes[0] ? notes[0] : errNote;
    },
    getNoteListing: () => {
      return notes.map((note) => {
        return {
          title: note.title,
          uri: note.uri,
          date: note.date.toDateString(),
          content: note.content,
        };
      });
    },
  };

  // generate RSS
  /**
   * This copying from an article to a blog and to a feed ist pretty ugly I think,
   * but the JS Promise library gives me trouble. I don't yet know how to make
   * this more elegant.
   */
  let articles = notes.map((n) => {
    return {
      title: n.title,
      description: unified()
        .use(remarkParse)
        .use(remark2rehype)
        .use(rehypeStringify)
        .process(n.content ? n.content : "")
        .then((file) => String(file))
        .catch((error) => {
          throw error;
        }),
      url: "https://www.rink.gallery/notes/" + n.uri,
      date: n.date,
    };
  });

  let blog = {
    title: "Rink.Gallery Notes",
    description: "just my thoughts on different topics.",
    author: "Markus Rink",
    articles: [],
  };

  const feed = new RSS({
    title: blog.title,
    description: blog.description,
    feed_url: "https://www.rink.gallery/rss.xml",
    site_url: "https://www.rink.gallery",
    language: "de",
    copyright: new Date().getFullYear() + " Markus Rink",
  });

  for (const a of articles) {
    a.description.then((resolved_description) => {
      feed.item({
        title: a.title,
        description: resolved_description,
        url: a.url,
        date: a.date,
      });
    });
  }

  const xml = feed.xml({ indent: true });
  writeFileSync("./assets/rss.xml", xml);
  console.log("Generated rss.xml");

  // Server
  const app = express();
  let varcors;
  if (String(process.env.NODE_ENV) !== "undefined") {
    console.log("CORS Origin localhost");
    varcors = cors({ origin: "http://localhost:3000" });
  } else {
    console.log("CORS Origin www.rink.gallery");
    varcors = cors({ origin: "https://www.rink.gallery" });
  }

  app.use(
    "/api",
    varcors,
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true, //rocess.env.NODE_ENV === "development" ? true : false,
    })
  );

  app.use("/images", varcors, express.static(Process.cwd() + "/assets/images"));
  app.use("/rss", varcors, express.static(Process.cwd() + "/assets/rss.xml")); // TODO Set cors to any

  app.listen(3001);
  console.log("Running at port 3001");
}

init();
