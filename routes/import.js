var express = require('express');
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });


router.post("/", upload.single("file"), function (req, res,next) {
    var csvData = req.file.buffer.toString();
    res.send(csvData);
  });


module.exports = router;
