const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const { Account } = require("./models/Account");

mongoose.connect(
  "mongodb://localhost:27017/myDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      process.exit();
    } else {
      console.log("connected to db");
    }
  }
);

let app = express();
app.use(express.json());
let PORT = 5000;

app.post("/register", async (req, res) => {
  let name = req.body.name;
  let accountType = req.body.accountType;

  let newUser = new User({ name });
  let newAccount = new Account({ accountType, user: newUser });

  try {
    await newUser.save();
    await newAccount.save();

    return res.json({
      newAccount,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Unable to create user",
      errorCode:400
    });
  }
});

app.post("/transfer", async (req, res) => {
  let { fromAccountId, toAccountId, amount } = req.body;
  try {
    let srcAccount = await Account.findById(fromAccountId);
    let destAccount = await Account.findById(toAccountId);
    console.log(srcAccount + " "  + destAccount.user)
    if(String(srcAccount.user) == String(destAccount.user)){
      return res.status(400).json({
        error:"Cannot transfer to own acccount",
        errorCode:400

      })
    }
    if (srcAccount.balance >= amount) {

      
      srcAccount = await Account.findByIdAndUpdate(srcAccount, {
        $inc: {
          balance: -amount,
        },
      });

      destAccount = await Account.findByIdAndUpdate(destAccount, {
        $inc: {
          balance: amount,
        },
      });

      let destUserId = destAccount.user;
      let destUserData = await Account.aggregate([
        {
          $match: {
            user: destUserId,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$balance",
            },
          },
        },
      ]);
      console.log(destUserData[0].total);

      return res.json({
        newSrcBalance: srcAccount.balance,
        totalDestBalance: destUserData[0].total,
        transferedAt: new Date(),
      });
    } else {
      return res.status(400).json({
        error: "Not enough balance",
        errorCode:400
      });
    }

  
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Transcation failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
