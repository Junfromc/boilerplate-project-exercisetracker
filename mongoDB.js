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
const User = mongoose.model('User', mySchema);

function createUserDoc(usernameArray, done){
    User.create(usernameArray)
    .then(data=>done(null, data))
    .catch(err=>done(err))
}
function updateUserDoc(id, exercises, done){
    User.findByIdAndUpdate(id, {$inc:{count: 1}, $push:{log:exercises}}, {new: true})
    .then(date=>done(null, date))
    .catch(err=>done(err))
}



exports.createUserDoc = createUserDoc;
exports.updateUserDoc = updateUserDoc;
exports.User = User;