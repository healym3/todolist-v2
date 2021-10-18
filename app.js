//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mac:" + process.env.MONGOPW + "@cluster0.lpqfl.mongodb.net/todolistDB?retryWrites=true&w=majority");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "<-- Hit this to delete an item."
});

const item3 = new Item({
  name: "Hit the + button to add a new item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
// Item.insertMany(defaultItems, function(err){
//   if (err) {
//     console.log("Something went wrong.");
//   } else {
//     console.log("Default items successfully added.");
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log("Unable to find items.");
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log("Something went wrong.");
          } else {
            console.log("Default items successfully added.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
      //console.log(foundItems);

    }
  });



});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        console.log(customListName, "created successfully.");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
      }
    }
  });


  //res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }

    });
  }


});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (err) {
        console.log("Error deleting item by ID.");
      } else {
        console.log("successfully deleted checked item.");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }


});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
