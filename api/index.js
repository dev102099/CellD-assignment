const express = require("express");
const multer = require("multer");
const app = express();
const port = 3000;
const handleTransaction = require("./controller/transactionControl");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Note: Ensure the uploads directory exists
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), handleTransaction);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
