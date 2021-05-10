import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/home/Home";
import ArticleList from "./components/home/ArticleList";
import Navbar from "./components/misc/Navbar";

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
        <Route path="/admin">
          <Register />
        </Route>
        <Route path="/articles">
          <ArticleList />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
