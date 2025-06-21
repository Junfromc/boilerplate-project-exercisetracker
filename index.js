const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { createUserDoc, updateUserDoc, User } = require("./mongoDB.js");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const raw = req.body.username;
  const username = raw && raw.trim();
  if (!username) {
    return res.status(400).send("username is invalid.");
  }

  createUserDoc([{ username }], (err, created) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const user = created[0];
    res.status(201).json({
      username: user.username,
      _id: user._id,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
