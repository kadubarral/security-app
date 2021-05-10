const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const articleSchema = new mongoose.Schema(
  {
    title: { type: String },
    post: { type: String },
    user: { type: ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model("article", articleSchema);

module.exports = Article;
