const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, urlsForUser, checkForUserExists } = require('./helper');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['testkey'],
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "testUser" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "testUser" }
};

const users = {
  "testUser": {
    id: "testUser",
    email: "test@example.com",
    password: "none"
  }
};

// routes
app.get('/', (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    let templateVars = {
      user: users[req.session.userId],
      message: "Please log-in to view your URLs"
    };
    res.render("urls_error", templateVars);
  } else {
    let templateVars = {
      urls: urlsForUser(req.session.userId, urlDatabase),
      user: users[req.session.userId],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: users[req.session.userId],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.userId) {
    let templateVars = {
      user: users[req.session.userId],
      message: "Please log-in to view your URLs"
    };
    res.render("urls_error", templateVars);
  } else if (urlDatabase[req.params.shortURL] === undefined) {
    let templateVars = {
      user: users[req.session.userId],
      message: "This TinyURL does not exist."
    };
    res.render("urls_error", templateVars);
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.userId) {
    let templateVars = {
      user: users[req.session.userId],
      message: "You may only edit your own URLs"
    };
    res.render("urls_error", templateVars);
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: longURL,
      user: users[req.session.userId]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    let templateVars = {
      user: users[req.session.userId],
      message: "This TinyURL does not exist."
    };
    res.render("urls_error", templateVars);
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.userId],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.userId],
  };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    let templateVars = {
      user: users[req.session.userId],
      message: "Please log-in to create TinyURLs"
    };
    res.render("urls_error", templateVars);
  } else {
    let key = generateRandomString();
    urlDatabase[key] = { longURL: req.body.longURL, userID: req.session.userId };
    res.redirect(`/urls/${key}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId !== urlDatabase[req.params.shortURL].userID) {
    res.redirect("/urls");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.userId) {
    let templateVars = {
      user: users[req.session.userId],
      message: "Please log-in to edit your URLs"
    };
    res.render("urls_error", templateVars);
  } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
    let templateVars = {
      user: users[req.session.userId],
      message: "you can only edit your own URLs"
    };
    res.render("urls_error", templateVars);
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let userId = checkForUserExists(email, users);
  if (!userId) {
    res.status(403).send('Username and password did not match.');
  } else if (!bcrypt.compareSync(password, users[userId].password)) {
    res.status(403).send('Username and password did not match.');
  } else {
    req.session.userId = userId;
    res.status(200).redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please enter a email and password');
  } else if (checkForUserExists(email, users)) {
    res.status(400).send('That email already exists.');
  } else {
    users[id] = { id: id, email: email, password: bcrypt.hashSync(password, 10) };
    req.session.userId = id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
