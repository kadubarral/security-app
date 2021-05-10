const router = require("express").Router();
const Seclevel = require("../models/seclevelModel");
const auth = require("../middleware/auth");

router.get("/seclevel", async (req, res) => {
  try {
    const seclevels = await Seclevel.find();
    res.json(seclevels);
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/seclevel", async (req, res) => {
  try {
    const { name, scl } = req.body;

    // validation

    if (!name) {
      return res.status(400).json({
        errorMessage: "You need to enter a name.",
      });
    }

    const newSeclevel = new Seclevel({
      name,
      scl,
    });

    const savedSeclevel = await newSeclevel.save();

    res.json(savedSeclevel);
  } catch (err) {
    res.status(500).send();
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const seclevelId = req.params.id;

    if (req.scl !== 1)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    // validation

    if (!name) {
      return res.status(400).json({
        errorMessage: "You need to enter a name.",
      });
    }

    if (!seclevelId)
      return res.status(400).json({
        errorMessage: "Security Level ID not given. Please contact the developer.",
      });

    const originalSeclevel = await Seclevel.findById(seclevelId);
    if (!originalSeclevel)
      return res.status(400).json({
        errorMessage:
          "No Security Level with this ID was found. Please contact the developer.",
      });

    originalSeclevel.name = name;

    const savedSeclevel = await originalSeclevel.save();

    res.json(savedSeclevel);
  } catch (err) {
    res.status(500).send();
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const seclevelId = req.params.id;

    if (req.scl !== 1)
      return res.status(401).json({ errorMessage: "Unauthorized." });
      
    // validation

    if (!seclevelId)
      return res.status(400).json({
        errorMessage: "Security Level ID not given. Please contact the developer.",
      });

    const existingSeclevel = await Seclevel.findById(seclevelId);
    if (!existingSeclevel)
      return res.status(400).json({
        errorMessage:
          "No Security Level with this ID was found. Please contact the developer.",
      });

    await existingSeclevel.delete();

    res.json(existingSeclevel);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
