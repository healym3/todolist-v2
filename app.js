//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "<-- Hit this to delete an item."
});

const item3 = new Item({
  name: "Hit the + button to add a new item."
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
//   if (err) {
//     console.log("Something went wrong.");
//   } else {
//     console.log("Default items successfully added.");
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function (err, foundItems){
    if (err){
      console.log("Unable to find items.");
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log("Something went wrong.");
          } else {
            console.log("Default items successfully added.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      //console.log(foundItems);

    }
  });



});

app.post("/", function(req, res){
  const item = new Item({
    name: req.body.newItem
  });
  item.save();
  res.redirect("/");

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
