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
var file = "users.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists){
    db.run("CREATE TABLE users (name TEXT, password TEXT, fish TEXT, type TEXT)");
  }
});





// CREATE a new user
app.post('/users', function (req, res) {
  var postHead = req.head;
  var postBody = req.body;
  var myName = postBody.name;
  var myPass = postBody.password;
  var accountType = postBody.type;

  // must have a name and password!
  if (!myName||!myPass) {
    res.send('ERROR');
    return; // return early!
  }
//insert USER into database db
  if(accountType == 1){
    db.run("INSERT INTO users VALUES (?,?,?,?)", myName, myPass, "", "owner");
    console.log("created owner account");
  }else{
    db.run("INSERT INTO users VALUES (?,?,?,?)", myName, myPass, "", "caretaker");
    console.log("created caretaker account");
  }

  res.send('OK');
});



// app.get('/search', function (req, res) {
//   var message = 'initialization';
//   var caretakerArray = [];
//   db.each("SELECT * FROM users WHERE type = \'caretaker\'", function(err, rows){
//     if(!rows){
//       console.log("null");
//       message = 'error';
//     }else{
//       console.log(rows.name);
//       caretakerArray.push({'name': rows.name});
//       message = 'maybe';
//     }
//   },
//   function(err, comp){
//     console.log(comp);
//   console.log('sending');
//   res.send({'names': caretakerArray});
//   });
// });

//login
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
        if(rows.type == "caretaker")
        res.send('./CTprofile.html');
       else if(rows.type == "owner")
         res.send('./FOprofile.html');
       else
        res.send('type error');
        return;
      }
      else{
        console.log("Password incorrect");
        res.send('error');
        return;
      }
    });
  });

// app.put('/loggedIn', function (req, res){
//   var putBody = req.body;
//   var nameToEdit = putBody.name;
//   var fishInfo = putBody.info;
//   db.run("UPDATE users SET fish = \"" + fishInfo + "\" WHERE name = \"" + nameToEdit + "\"", function(err,rows){
//     console.log("wrote: " + fishInfo);
//   });
// });

function getAvgRating(username)
{
  var sum = 0;
  db.each("SELECT rating FROM "+username, function(err,rows)
  {
    if(err)
    {
      return 0;
    }
   else{
    console.log("Rating is: "+rows[0].rating);
    for(var i = 0; i<rows.length; i++)
      sum=sum+rows[i].rating;
    var avg = sum/rows.length;
  return avg;
}
  });
  
}

app.get('/marketplace/', function (req, res) {
 

  var message = 'initialization';
  var caretakerArray = [];
  var ratingArray = [];
  db.each("SELECT * FROM users WHERE type = \'caretaker\'", function(err, rows){
    if(!rows){
      console.log("null");
      message = 'error';
    }else{
      console.log(rows.name);
      caretakerArray.push({'name': rows.name});
      ratingArray.push({'rating': getAvgRating(rows.name)})
      //console.log(getAvgRating(rows.name));
      message = 'maybe';
    }
  },
  function(err, comp){
    console.log(comp);
  console.log('sending');
  res.send({'names': caretakerArray});
  });
});


app.put('/CTprofile/', function(req, res)
{
 var postBody = req.body;
 var username = postBody.username;
 var first = postBody.first;
 var descr = postBody.descr;
 var dorm= postBody.dorm;
 var fall= postBody.fall;
 var thanks= postBody.thanks;
 var winter= postBody.winter;
 var mlk= postBody.mlk;
 var spring= postBody.spring;



db.serialize(function() {
  //creates a bunch of the same entries, but there's nothing I can do about it
   db.run("CREATE TABLE IF NOT EXISTS CTprofiles (username TEXT, firstname TEXT, description TEXT, dorm TEXT, fall TEXT, thanksgiving TEXT, winter TEXT, mlk TEXT, spring TEXT)"); 
  
  db.get("SELECT * FROM CTprofiles WHERE username = \"" + username+ "\"", function(err, rows){
    console.log(rows);
    if(!rows){
      db.run("INSERT INTO CTprofiles VALUES (?,?,?,?,?,?,?,?,?)", username, first, descr, dorm, fall, thanks, winter, mlk, spring);
      console.log("Created CareTaker profile for " +username);
    }else{
      db.run("UPDATE CTprofiles SET firstname = \"" + first + "\", description = \"" + descr + "\", dorm = \"" + dorm + "\", fall = \"" + fall + "\", thanksgiving = \"" + thanks + "\", winter= \"" + winter + "\", mlk = \"" + mlk + "\", spring = \"" + spring + "\" WHERE username = \"" + username + "\"", function(err,result){
    console.log("Updated CareTaker profile for " +username);
        });//close update  
    }
  }); 
    /*db.run("INSERT INTO CTprofiles VALUES (?,?,?,?,?,?,?,?,?)", username, first, descr, dorm, fall, thanks, winter, mlk, spring);

       db.run("UPDATE CTprofiles SET firstname = \"" + first + "\", description = \"" + descr + "\", dorm = \"" + dorm + "\", fall = \"" + fall + "\", thanksgiving = \"" + thanks + "\", winter= \"" + winter + "\", mlk = \"" + mlk + "\", spring = \"" + spring + "\" WHERE username = \"" + username + "\"", function(err,result)
    {
    console.log("Updated CareTaker profile for " +username);
   });//close update  */  
   
    res.send('OK');
});
});

app.put("/FOprofile/", function(req, res)
{
 var postBody = req.body;
 var username = postBody.username;
 var first = postBody.first;
 var fish = postBody.fishnum;
 var finfoe = postBody.fishinfo;
 var fall= postBody.fall;
 var thanks= postBody.thanks;
 var winter= postBody.winter;
 var mlk= postBody.mlk;
 var spring= postBody.spring;


db.serialize(function() {
  //creates a bunch of the same entries, but there's nothing I can do about it
   db.run("CREATE TABLE IF NOT EXISTS FOprofiles (username TEXT, firstname TEXT, fishnum TEXT, fishinfo TEXT, fall TEXT, thanksgiving TEXT, winter TEXT, mlk TEXT, spring TEXT)"); 
      
    db.run("INSERT INTO FOprofiles VALUES (?,?,?,?,?,?,?,?,?)", username, first, fish, finfoe, fall, thanks, winter, mlk, spring);

       db.run("UPDATE FOprofiles SET firstname = \"" + first + "\", fishnum= \"" + fish + "\", fishinfo= \"" + finfoe + "\", fall = \"" + fall + "\", thanksgiving = \"" + thanks + "\", winter= \"" + winter + "\", mlk = \"" + mlk + "\", spring = \"" + spring + "\" WHERE username = \"" + username + "\"", function(err,result)
    {
    console.log("Updated Fishowner profile for " +username);
   });//close update  
  

  
    
    
    
   
    res.send('OK');
});

});




app.put('/review/', function(req, res)
{
 var postBody = req.body;
 var username = postBody.username;
 var review = postBody.review;
 var rating = postBody.rating;
 var caretaker= postBody.caretaker;

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS "+caretaker+" (user TEXT, review TEXT, rating INT)");
    db.run("INSERT INTO "+caretaker+" VALUES (?,?,?)", username, review, rating);
    console.log("Added review for " +caretaker+" from "+username);
    res.send('OK');
});

});


var server = app.listen(1420, function () {
  var port = server.address().port;
  console.log('Server started at http://localhost:%s/', port);
});
