const router = require("express").Router();
const Article = require("../models/articleModel");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const articles = await Article.find({ user: req.user });
    res.json(articles);
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, post } = req.body;

    // validation

    if (!post) {
      return res.status(400).json({
        errorMessage: "You need to enter a post.",
      });
    }

    const newArticle = new Article({
      title,
      post,
      user: req.user,
    });

    const savedArticle = await newArticle.save();

    res.json(savedArticle);
  } catch (err) {
    res.status(500).send();
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, post } = req.body;
    const articleId = req.params.id;

    // validation

    if (!post) {
      return res.status(400).json({
        errorMessage: "You need to enter a post.",
      });
    }

    if (!articleId)
      return res.status(400).json({
        errorMessage: "Article ID not given. Please contact the developer.",
      });

    const originalArticle = await Article.findById(articleId);
    if (!originalArticle)
      return res.status(400).json({
        errorMessage:
          "No article with this ID was found. Please contact the developer.",
      });

    if (originalArticle.user.toString() !== req.user)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    originalArticle.title = title;
    originalArticle.post = post;

    const savedArticle = await originalArticle.save();

    res.json(savedArticle);
  } catch (err) {
    res.status(500).send();
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const articleId = req.params.id;

    // validation

    if (!articleId)
      return res.status(400).json({
        errorMessage: "Article ID not given. Please contact the developer.",
      });

    const existingArticle = await Article.findById(articleId);
    if (!existingArticle)
      return res.status(400).json({
        errorMessage:
          "No article with this ID was found. Please contact the developer.",
      });

    if (existingArticle.user.toString() !== req.user)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    await existingArticle.delete();

    res.json(existingArticle);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
