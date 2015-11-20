//Violeta Lopez, Nicholas Gekakis, Celine Anand
//This is adapted code from Philip Guo's lectures 11 and 12
// This is the backend for URWatchMyFish
//It demenstrates the C in CRUD with ajax
//static_files/main.html is the frontend

// Prerequisites - first run:
//   npm install express
//   npm install body-parser
//
//Celine is cooler than Violeta :)
//This is random text
//test2
var express = require('express');
var app = express();

// required to support parsing of POST request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('static_files'));

var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists){
    db.run("CREATE TABLE users (name TEXT, password TEXT, fish TEXT)");
  }
});


app.use(express.static('static_files'));


// CREATE a new user
app.post('/users', function (req, res) {
  var postBody = req.body;
  var myName = postBody.name;
  var myPass = postBody.password;

  // must have a name and password!
  if (!myName||!myPass) {
    res.send('ERROR');
    return; // return early!
  }
//insert USER into database db
  db.run("INSERT INTO users VALUES (?,?,?)", myName, myPass, "");

  res.send('OK');
});

app.post('/users/*', function (req, res) {
  var postBody = req.body;
  var nameToLookup = postBody.name; // this matches the '*' part of '/users/*' above
  var givenPassword = postBody.password;
  // try to look up in fakeDatabase
    db.each("SELECT * FROM users WHERE name = \"" + nameToLookup + "\"", function(err, rows){
      if(rows.name == null){
        console.log("No response");
        res.send('error');
        return;
      }else if(rows.password == givenPassword){
        console.log("Hello, " + rows.name);
        res.send('/loggedIn.html');
        return;
      }
      else{
        console.log("Password incorrect");
        res.send('error');
        return;
      }
    });
  });

app.put('/loggedIn', function (req, res){
  var putBody = req.body;
  var nameToEdit = putBody.name;
  var fishInfo = putBody.info;
  db.run("UPDATE users SET fish = \"" + fishInfo + "\" WHERE name = \"" + nameToEdit + "\"", function(err,rows){
    console.log("wrote: " + fishInfo);
  });
});
// start the server on http://localhost:1420/
var server = app.listen(1420, function () {
  var port = server.address().port;
  console.log('Server started at http://localhost:%s/', port);
});
