var express = require('express');
var router = express.Router();
const fs = require("fs")
const path = require("path")



router.post("/", function (req, res,next) {
    fs.writeFile(path.resolve(__dirname, "../data/savedData.json"), JSON.stringify(req.body), (error) => {
    });
  });


module.exports = router;
