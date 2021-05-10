const mongoose = require("mongoose");

const seclevelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    scl: { type: Number, required: true }
  },
  {
    timestamps: true,
  }
);

const Seclevel = mongoose.model("seclevel", seclevelSchema);

module.exports = Seclevel;
