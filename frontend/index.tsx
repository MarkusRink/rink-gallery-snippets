import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import WebFont from "webfontloader";

import GalleryPage from "./pages/GalleryPage";
import Notes from "./pages/Notes";

WebFont.load({
  google: {
    families: ["Rubik"],
  },
});
const reload = () => window.location.reload();
ReactDOM.render(
  <Router>
    <React.StrictMode>
      <Switch>
        <Route exact path="/" component={GalleryPage}></Route>
        <Route path="/notes/:noteTitle" children={<Notes />}></Route>
        <Route path="/notes/">
          <Redirect to="/notes/latest" />
        </Route>
        <Route>404 - No match found.</Route>
      </Switch>
    </React.StrictMode>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
