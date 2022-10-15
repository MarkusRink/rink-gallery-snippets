import { title } from "process";
import React, { useEffect, useState, MouseEvent } from "react";
import { Link, Route, useParams } from "react-router-dom";
import classesNav from "./styling/NavTree.module.sass";
interface QueryGetNoteListing {
  data:
    | undefined
    | {
        getNoteListing: [{ title: string; uri: string; date: Date}];
      };
}

type props = {
  cname?: string;
};

const Menu: React.FC<props> = (props) => {
  const api:string = process.env.NODE_ENV === 'development' ? "http://localhost:3001/api" : "https://api.rink.gallery/api";
  const [collapseContact, toggleContact] = useState(true);
  const [collapseNotes, toggleNotes] = useState(true);
  const [notes, loadNotes] = useState<Array<{ uri: String; title: String; date: Date}>>();
  let { noteTitle } = useParams<{ noteTitle: string }>();

  // fetch note entries
  useEffect(() => {
    fetch(api, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{ 
            getNoteListing{
              title
              date
              uri
            }
          }`.replace(/\h/g, ""),
      }),
    })
      .catch() // Fetching didn't work, maybe unresponsive backend. How to handle? Page reload/try later.
      .then((res) => res.json())
      .then((res: QueryGetNoteListing) => {
        if (res.data !== undefined) {
          loadNotes(res.data.getNoteListing
            .map(n => { return { title: n.title, date: new Date(n.date), uri: n.uri } })
            .sort((a, b) => b.date.getTime() - a.date.getTime())
          );
        }
      }); 
  }, []);

  const handleToggleNotes = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleNotes(!collapseNotes);
  };

  const handleToggleContact = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleContact(!collapseContact);
  };

  return (
    <div className={props.cname}>
      <ul className={classesNav.nav_general}>
        <Route
          render={({ location }) =>
            location.pathname !== "/" ? (
              <li>
                <Link to="/">//gallery</Link>
              </li>
            ) : null
          }
        ></Route>

        <li>
          <button onClick={(event) => handleToggleContact(event)}>
            //contact
          </button>
          <ul className={classesNav.nav_tree}>
            {!collapseContact && (
              <li>
                <div>
                  <a href="https://www.instagram.com/m.a.r.k.u.s_r/">
                    instagram
                  </a>
                </div>
              </li>
            )}
            {!collapseContact && (
              <li>
                <div>
                  <a href="https://api.rink.gallery/rss">
                    RSS
                  </a>
                </div>
              </li>
            )}
          </ul>
        </li>
        
        <li>
          <button onClick={(event) => handleToggleNotes(event)}>//notes</button>
          {!collapseNotes && (
            <ul className={classesNav.nav_tree}>
              {notes?.map((note) => (
                <li>
                  <div>
                    <Link to={`/notes/${note.uri}`} className={noteTitle === note.uri? classesNav.selected: ""} >{note.title}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Menu;
