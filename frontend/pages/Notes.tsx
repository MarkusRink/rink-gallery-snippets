import React, { useEffect, useState } from "react";
import ReactMarkdownWithHtml from "react-markdown/with-html";
import { useParams } from "react-router-dom";
import Menu from "../components/Menu";
import classes from "../components/styling/Notes.module.sass";
interface Note {
  title: string;
  date: Date;
  content: string;
}

interface QueryGetNote {
  data: {
    getNote: Note;
  };
}

function Notes() {
  let { noteTitle } = useParams<{ noteTitle: string }>();
  const api = process.env.NODE_ENV === 'development' ? "http://localhost:3001/api" : "https://api.rink.gallery/api";
  const [note, updateNote] = useState<Note>({
    title: "",
    date: new Date(),
    content: "loading ...",
  });

  // Load Page from GraphQL API Backend
  useEffect(() => {
    if (noteTitle === "latest") {
      fetch(api, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{ 
            getLatestNote { 
              title
              date
              content
            }
          }`.replace(/\t/g, ""),
        }),
      })
        .then((res) => res.json())
        .then((res: any) => updateNote({ title: res.data.getLatestNote.title, date: new Date(res.data.getLatestNote.date), content: res.data.getLatestNote.content }))
        .catch(
          (_): Note => {
            return { title: "404", date: new Date(), content: "Couldn't find that note :(" };
          }
        );
    } else if (noteTitle !== "") {
      fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{ 
            getNote(uri:  "${noteTitle}" ){ 
              title
              date
              content
            }
          }`.replace(/\t/g, ""),
        }),
      })
        .then((res) => res.json())
        .then((res:any) => updateNote({ title: res.data.getNote.title, date: new Date(res.data.getNote.date), content: res.data.getNote.content }))
        .catch(
          (_): Note => {
            return { title: "404", date: new Date() , content: "Couldn't find that note :(" };
          }
      );
    }
  }, [noteTitle]);

  return (
    <div>
      <Menu />
      <p className={classes.date}>{note.date && typeof note.date.getMonth === 'function' ?
        `${note.date.getDate()} \u00B7 ${note.date.getMonth()} \u00B7 ${note.date.getFullYear()}` : ""}</p>
      <article className={classes.article}>
        <ReactMarkdownWithHtml allowDangerousHtml>{note.content}</ReactMarkdownWithHtml>
      </article>
    </div>
  );
}

export default Notes;
