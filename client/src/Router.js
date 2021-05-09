import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/home/Home";
import Navbar from "./components/misc/Navbar";
import Article from "./components/articles/Article";
import ArticleTest from "./components/articles/ArticleTest";
import ArticleEditor from "./components/articles/ArticleEditor";

function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/article/:id" component={Article} />
        <Route path="/editor" component={ArticleEditor} />
        <Route path="/articleTest" component={ArticleTest} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
