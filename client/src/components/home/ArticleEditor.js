import React, { useEffect, useState } from "react";
import Axios from "axios";
import "./ArticleEditor.scss";
import ErrorMessage from "../misc/ErrorMessage";
import domain from "../../util/domain";

function ArticleEditor({ getArticles, setArticleEditorOpen, editArticleData }) {
  const [editorTitle, setEditorTitle] = useState("");
  const [editorPost, setEditorPost] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (editArticleData) {
      setEditorTitle(editArticleData.title ? editArticleData.title : "");
      setEditorPost(editArticleData.post ? editArticleData.post : "");
    }
  }, [editArticleData]);

  async function saveArticle(e) {
    e.preventDefault();

    const articleData = {
      title: editorTitle ? editorTitle : undefined,
      post: editorPost ? editorPost : undefined,
    };

    try {
      if (!editArticleData) await Axios.post(`${domain}/article/`, articleData);
      else
        await Axios.put(
          `${domain}/article/${editArticleData._id}`,
          articleData
        );
    } catch (err) {
      if (err.response) {
        if (err.response.data.errorMessage) {
          setErrorMessage(err.response.data.errorMessage);
        }
      }
      return;
    }

    getArticles();
    closeEditor();
  }

  function closeEditor() {
    setArticleEditorOpen(false);
    setEditorPost("");
    setEditorTitle("");
  }

  return (
    <div className="article-editor">
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          clear={() => setErrorMessage(null)}
        />
      )}
      <form className="form" onSubmit={saveArticle}>
        <label htmlFor="editor-title">Title</label>
        <input
          id="editor-title"
          type="text"
          value={editorTitle}
          onChange={(e) => setEditorTitle(e.target.value)}
        />

        <label htmlFor="editor-post">Post</label>
        <textarea
          id="editor-post"
          value={editorPost}
          onChange={(e) => setEditorPost(e.target.value)}
        />

        <button className="btn-save" type="submit">
          Save
        </button>
        <button className="btn-cancel" type="button" onClick={closeEditor}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default ArticleEditor;
