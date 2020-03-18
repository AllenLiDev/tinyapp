const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let char = chars[Math.floor((Math.random() * 26) + 1)];
    randomString += char;
  }
  return randomString;
};

const checkForUserExists = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user].id;
    }
  }
  return false;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

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

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
  };
  console.log(req.cook)
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: longURL,
    user: users[req.cookies.user_id]
  };
  console.log(req.cook)
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let userId = checkForUserExists(email);
  if (!userId) {
    res.status(403).send('Username and password did not match.')
  } else if (users[userId].password !== password) {
    res.status(403).send('Username and password did not match.')
  } else {
    res.cookie('user_id', userId);
    res.status(200).redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please enter a email and password');
  } else if (checkForUserExists(email)) {
    res.status(400).send('That email already exists.');
  } else {
    users[id] = { id: id, email: email, password: password };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
