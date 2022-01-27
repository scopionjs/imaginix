let express = require("express");
let controllers = require("../controllers/controllers");
let route = express.Router();
route.post("/addimage", controllers.addFile);
route.get("/allimages", controllers.getFiles);
route.get("/oneimage/:imageOwner", controllers.getOneFile);
route.delete("/deleteimage/:imageOwner", controllers.deleteOneImage);
module.exports = {
  route,
};
