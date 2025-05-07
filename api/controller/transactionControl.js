const fs = require("fs");
const csv = require("csv-parser");

const handleTransaction = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }
  if (req.file.mimetype !== "text/csv") {
    return res.status(400).json({ error: "Invalid file type" });
  }
  const userSummary = {};
  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => {
      const {
        TransactionID,
        UserID,
        Amount,
        Date,
        "Transaction Type": Type,
      } = data;
      if (!UserID || !Amount || !Type) return;

      const amount = parseFloat(Amount);
      if (isNaN(amount)) return;

      if (!userSummary[UserID]) {
        userSummary[UserID] = { credit: 0, debit: 0, total: 0 };
      }
      if (Type.toLowerCase() === "credit") {
        userSummary[UserID].credit += parseFloat(Amount);
      }
      if (Type.toLowerCase() === "debit") {
        userSummary[UserID].debit += parseFloat(Amount);
      }
      userSummary[UserID].total += parseFloat(Amount);
    })
    .on("end", () => {
      let maxTransactionUser = null;
      let maxTransaction = 0;
      for (const user in userSummary) {
        if (userSummary[user].total > maxTransaction) {
          maxTransaction = userSummary[user].total;
          maxTransactionUser = user;
        }
      }
      res.json({
        summary: userSummary,
        maxTransactionUser: maxTransactionUser,
      });
    });
};
module.exports = handleTransaction;
