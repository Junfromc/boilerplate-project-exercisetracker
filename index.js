const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
const {
  createUserDoc,
  updateUserDoc,
  getUserDocById,
  getUserDocs,
  User,
} = require("./mongoDB.js");

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
    date = new Date();
  } else {
    date = new Date(date);
  }

  updateUserDoc(id, { description, duration, date }, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if(!result[0] || !result[1]){
      return res.status(404).send("User not found.");
    }
    const { _id, username } = result[1];
    const { description, duration, date } = result[0];
    res.status(200).json({
      _id,
      username,
      description,
      duration,
      date: date.toDateString(),
    });
  });
});

app.get("/api/users", (req, res) => {
  getUserDocs((err, usersArray) => {
    if (err) {
      return res.status(400).json({ error: err.messsage });
    }
    if(!usersArray || usersArray.length === 0){
      return res.status(404).send('No users found.');
    }
    res.status(200).json(usersArray);
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id.trim();
  if (!id) {
    return res.status(400).send("id is required.");
  }
  let { from, to, limit } = req.query;
  let query = {};
  limit = Number(limit);
  limit = Number.isInteger(limit) && limit >= 1 ? limit : undefined;

  from = dateRegex.test(from) ? new Date(from) : undefined;
  to = dateRegex.test(to) ? new Date(to) : undefined;
  if (from && to) {
    query = to > from ? { from, to, limit } : { from: to, to: from, limit };
  } else if (from) {
    to = new Date(from);
    to.setMonth(to.getMonth() + 3);
    query = { from, to, limit };
  } else if (to) {
    from = new Date(to);
    from.setMonth(from.getMonth() - 3);
    query = { from, to, limit };
  } else {
    query = { limit };
  }

  getUserDocById(id, query, (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).send("User not found.");
    }
    const { username, _id, logs, count } = user;
    res.status(200).json({
      _id,
      username,
      count,
      logs,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
