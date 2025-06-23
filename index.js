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

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id.trim();
  let { description, duration, date } = req.body;
  description = description && description.trim();
  duration = duration && Number(duration);
  date = date && date.trim();
  if (!description && !duration) {
    return res.status(400).send("description and duration are required.");
  }
  // date = false; date = invalid date format; date = valid date format;
  if (!date || isNaN(new Date(date))) {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }

  updateUserDoc(id, { description, duration, date }, (err, updated) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json(updated);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
