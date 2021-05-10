import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Article from "./Article";
import ArticleEditor from "./ArticleEditor";
import "./Home.scss";
import UserContext from "../../context/UserContext";
import { Link } from "react-router-dom";
import domain from "../../util/domain";

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [articleEditorOpen, setArticleEditorOpen] = useState(false);
  const [editArticleData, setEditArticleData] = useState(null);

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) setArticles([]);
    else getArticles();
  }, [user]);

  async function getArticles() {
    const articlesRes = await Axios.get(`${domain}/article/all`);
    setArticles(articlesRes.data);
  }

  function editArticle(articleData) {
    setEditArticleData(articleData);
    setArticleEditorOpen(true);
  }

  function renderArticles() {
    let sortedArticles = [...articles];
    sortedArticles = sortedArticles.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedArticles.map((article, i) => {
      return (
        <Article
          key={i}
          article={article}
          getArticles={getArticles}
          editArticle={editArticle}
        />
      );
    });
  }

  return (
    <div className="home">
      {!articleEditorOpen && user && (
        <button
          className="btn-editor-toggle"
          onClick={() => setArticleEditorOpen(true)}
        >
          Add article
        </button>
      )}
      {articleEditorOpen && (
        <ArticleEditor
          setArticleEditorOpen={setArticleEditorOpen}
          getArticles={getArticles}
          editArticleData={editArticleData}
        />
      )}
      {articles.length > 0
        ? renderArticles()
        : user && (
            <p className="no-articles-msg">No articles have been added yet.</p>
          )}
      {user === null && (
        <div className="no-user-message">
          <h2>Welcome to Article manager</h2>
          <Link to="/login">Login</Link>
        </div>
      )}
    </div>
  );
}

export default ArticleList;