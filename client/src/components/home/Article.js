import Axios from "axios";
import React from "react";
import domain from "../../util/domain";
import "./Article.scss";

function Article({ article, getArticles, editArticle }) {
  async function deleteArticle() {
    if (window.confirm("Do you want to delete this article?")) {
      await Axios.delete(`${domain}/article/${article._id}`);

      getArticles();
    }
  }

  return (
    <div className="article">
      {article.title && <h2 className="title">{article.title}</h2>}
      {article.post && (
        <pre className="post">
          <post>{article.post}</post>
        </pre>
      )}
      <button className="btn-edit" onClick={() => editArticle(article)}>
        Edit
      </button>
      <button className="btn-delete" onClick={deleteArticle}>
        Delete
      </button>
    </div>
  );
}

export default Article;
