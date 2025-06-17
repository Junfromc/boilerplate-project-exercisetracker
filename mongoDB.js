require(".env").config();
const mongoose = require("mingoose");
mongoose.connect(process.env.MONGO_URI);
const mySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  log: [
    {
      description: String,
      duration: Number,
      date: { type: String, default: () => new Date().toDateString() },
    },
  ],
  count: { type: Number, default: 0 },
});
