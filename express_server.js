const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

// DATA
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// functions
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
};

const urlsForUser = (userID) => {
  let myUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      myUrls[url] = urlDatabase[url];
    }
  }
  return myUrls;
};

// routes
app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      urls: urlsForUser(req.cookies.user_id),
      user: users[req.cookies.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else if (urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: longURL,
      user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/login", (req, res) => {
  console.log(users);
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.redirect("/urls");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.redirect("/urls");
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let userId = checkForUserExists(email);
  if (!userId) {
    res.status(403).send('Username and password did not match.')
  } else if (!bcrypt.compareSync(password, users[userId].password)) {
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

    users[id] = { id: id, email: email, password: bcrypt.hashSync(password, 10) };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
