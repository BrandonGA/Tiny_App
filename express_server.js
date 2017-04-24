const express = require("express");
const cookieSession = require('cookie-session')
const app = express();
const bcrypt = require('bcrypt');
 app.use(cookieSession({
   name: 'session',
   keys: ['key1']
 }));
const PORT = process.env.PORT || 3000; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca",
              userId: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com",
              userId: "user2RandomID"}
};

// HomePage Nothing Showing Yet!
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// user registration
app.get("/registration", (req, res) => {
  res.render("registration")
});


// Register Page, Throws Errors If Password or
// Email is an Empty String... Generates Random
// UserId and Stores in Users Object
app.post("/registration", (req, res) => {
if (req.body.email === "") {
  res.status(400);
  res.send('Sorry Pal Bad Request: Enter Email');
}
if (req.body.password === "") {
  res.status(403);
  res.send('Sorry Pal Bad Request: Enter Password');
}
const password = req.body.password;
const hashed_password = bcrypt.hashSync(password, 10);
//console.log(hashed_password)
let newUser = createNewUser(req.body.email, hashed_password)
  //console.log(newUser.Id)
  req.session.userId = newUser.id
  res.status(200);
  res.redirect("/urls")
});



app.get("/login", (req,res) => {
  res.render("login")
});

app.post("/login", (req, res) => {
  for (id in users){
    if (req.body.loginEmail === users[id].email) {
    if  (bcrypt.compareSync(req.body.loginPassword, users[id].password)){
        res.session.userId = id
        res.redirect("/")
      }
    } else {
        res.status(403);
        res.send('Sorry Pal You Are Forbidden');
    }
  }
});


app.post("/logout", (req, res) => {
  res.session.userId = id
  res.clearCookie("user_id")
  res.redirect("/")
});


// Add New Long URLS
app.get("/urls/new", (req, res) => {
  console.log(req.session.userId)
  if (verifyUserIsLoggedIn(req.session.userId)) {
    let templateVars = {user: users[req.session.userId],};
    res.status(200);
    res.render("urls_new", templateVars);
  }else {
    res.status(401);
    res.render("sorry");
  }
});


// After Inputing New Long URL Redirects Back To URLS Page
// With Shortened Key
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: 'http://' + req.body.longURL,
    userId: req.session.userId
  }
  res.redirect("/urls")
});


// URLS Page Hosts Shorten and Long URLS
// Also has Delete & Update Functions
app.get("/urls", (req, res) => {
  let user = {}
  if (users[req.session.userId]) {
    user = users[req.session.userId]
  }
  // else {
  //   res.status(401);
  //   res.render("sorry")
  // }
  let templateVars = {
    user,
    urls: findShortURLsByUserId(req.session.userId)
  };
  res.render("urls_index", templateVars);
});


// Delete Specific URL Route
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  delete urlDatabase[shortURL]
  let templateVars = {urls: urlDatabase,
                      user: users[req.session.userId]}
    // res.render("urls_index", templateVars)
    res.redirect("/urls");
});


// Update Long URL
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
    if (urlDatabase[shortURL]) {
      urlDatabase[shortURL] = req.body.update;
    }
  res.redirect("/urls")
});


// Takes Shortened URL Key Thats A Link On URLS Page
// Redirects To Long URL Page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  //console.log(req.params.shortURL)
  let url = urlDatabase[shortURL];
  let longURL = url.longURL;
  //console.log(longURL)
  res.redirect(longURL);
});



// Page Shows Short URL & Long URL via Using
// Short URL In Link
app.get("/urls/:id", (req, res) => {
  //console.log('/urls/:id')
  let templateVars = {
    shortURL: req.params.id,
    urlDatabase: urlDatabase,
   };
  res.render("urls_show", templateVars);
});



// Port Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// functions

// function to create new short URL Key Generator
function generateRandomString() {
  var random_Short_URL = ''
  var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 1; i <= 6; i++) {
    random_Short_URL += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return random_Short_URL;
}

// function to create new user
function createNewUser (email, userPassword) {
  const password = userPassword;
  const hashed_password = bcrypt.hashSync(password, 10);
    let userId = generateRandomString()
      users[userId] = {
      id: userId,
      email: email,
      password: hashed_password,
    };
  return users[userId]
}

// function to find URL by user
function findShortURLsByUserId (userId) {
  let urls = []
  for (let shortUrl in urlDatabase) {
    if (userId == urlDatabase[shortUrl].userId) {
       urls.push({shortUrl:  shortUrl, longURL: urlDatabase[shortUrl].longURL})
    }
  }
  //console.log(urls);
  return urls
}

// function to verify if user is logged in
function verifyUserIsLoggedIn (cookie) {
  if (cookie === undefined) {
    return false;
  } else {
    return true;
  }
}


// var obj = {
//   "Toronto": "Blue Jays",
//   "San Francisco": "Giants"
// }
//
// // --> Blue Jays
// obj[0] //arrays[index]
// obj.Toronto
// obj['Toronto']
