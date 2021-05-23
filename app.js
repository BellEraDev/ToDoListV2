//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://watcharapun:@Bell2540@cluster0.vpymh.mongodb.net/todolist", {useNewUrlParser: true, useUnifiedTopology: true })

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Add a todo to get started"
})

const defaultItems = [item1]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


// Item.insertMany(defaultItems, (err) => {
//     if(err) {
//       console.log(err)
//     } else {
//       console.log("successful!")
//     }
//     })

// Item.find({item: ""}, (err) => {
//   if(err) {
//     console.log(err)
//   } else {
//     mongoose.connection.close()
//   }
// })

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err) {
          console.log(err)
        } else {
          console.log("successful!")
        }
      })
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }


  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName
  console.log(listName)

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("successfull!")
        res.redirect("/")
      } else {
        console.log(err)
      }
    })
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName)
        } else {
          console.log(err)
        }
      }
    )
  }

})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, (err, foundList) => {
    if(!err) {
    if(foundList) {
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
    } else {
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
    }
  } else {
    res.redirect("/")
  }
  })

  // const list = new List({
  //   name: customListName,
  //   items: defaultItems
  // })

})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started!");
});
