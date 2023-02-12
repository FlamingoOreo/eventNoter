var express = require('express');
var router = express.Router();
const fs = require("fs")
const path = require("path")

/* GET home page. */
router.get('/', function(req, res, next) {
  let data = fs.readFileSync(path.resolve(__dirname, "../data/data.json"));
  let preset = fs.readFileSync(path.resolve(__dirname, "../data/savedData.json"));
  let parsedData = JSON.parse(data);
  let parsedPreset = JSON.parse(preset);
  res.render('index', { data: parsedData, preset: parsedPreset});
});

router.post('/', function(req,res,next){
  const data = req.body.data;
  fs.writeFile(path.resolve(__dirname, "../data/data.json"), JSON.stringify(data), (error) => {
    if (error) {
      return res.status(500).send({ error: error.message });
    }
    return res.status(200).send({ message: "Data saved successfully." });
  });
});



module.exports = router;
