require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  logs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Log" }],
});
const logSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const User = mongoose.model("User", userSchema);
const Log = mongoose.model("Log", logSchema);

function createUserDoc(usernameArray, done) {
  User.create(usernameArray)
    .then((data) => done(null, data))
    .catch((err) => done(err));
}
function updateUserDoc(id, log, done) {
  User.findById(id)
    .then((userFound) => {
      if (!userFound) {
        return done(new Error("User not found"));
      }
      let newLog = new Log({ ...log, userId: id });
      newLog.save().then((doc) => {
        console.log(doc);
        User.findByIdAndUpdate(
          id,
          { $inc: { count: 1 }, $push: { logs: doc._id } },
          { new: true }
        ).then((updated) => done(null, [doc, updated]));
      });
    })
    .catch((err) => done(err));
}

async function getUserDocs(done) {
  try {
    const users = await User.find().select({ username: 1, _id: 1 });
    done(null, users);
  } catch (err) {
    done(err);
  }
}

function getUserDocById(id, query, done) {
  const { from, to, limit } = query;
  let filter = {};
  if (from === undefined && to === undefined) {
    filter = {};
  } else {
    filter = {
      date: {
        $gte: from,
        $lte: to,
      },
    };
  }
  User.findById(id)
    .populate({
      path: "logs",
      match: filter,
      select: "description duration date",
      options: { sort: { date: -1 }, limit: limit },
    })
    .exec(done);
}
// const mySchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   log: [
//     {
//       description: String,
//       duration: Number,
//       date: { type: String, default: () => new Date().toDateString() },
//     },
//   ],
//   count: { type: Number, default: 0 },
// });
// const User = mongoose.model('User', mySchema);

// function createUserDoc(usernameArray, done){
//     User.create(usernameArray)
//     .then(data=>done(null, data))
//     .catch(err=>done(err))
// }
// function updateUserDoc(id, log, done){
//     User.findByIdAndUpdate(id, {$inc:{count: 1}, $push:{log:log}}, {new: true})
//     .then(data=>done(null, data))
//     .catch(err=>done(err))
// }
// function getUserDocs(done){
//     User.find().select({username: 1, _id: 1}).exec(done);
// }
// function getUserDocById(id, from, to, limit, done){
//     User.findById(id).where('log.date').gt(new Date(from)).lt(new Date(to)).limit(limit).select({_v: 0}).exec(done);
// }

exports.createUserDoc = createUserDoc;
exports.updateUserDoc = updateUserDoc;
exports.getUserDocById = getUserDocById;
exports.getUserDocs = getUserDocs;
exports.User = User;
