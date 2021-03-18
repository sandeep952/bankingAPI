const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema({
  accountType: {
    type: String,
    enum: ["Savings", "Current", "BasicSavings"],
   
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  balance: {
    type: Number,
    default: 0,
  },
});
AccountSchema.methods.verifyBalance = (amountToAdd) => {
  if (
    this.accountType === "BasicSavings" &&
    this.balance + amountToAdd > 50000
  ) {
    return false;
  }
  return true;
};

let Account = mongoose.model("Account", AccountSchema);
module.exports = { Account, AccountSchema };
