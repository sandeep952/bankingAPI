const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  
});

let User = mongoose.model("User", UserSchema);
module.exports = User;
