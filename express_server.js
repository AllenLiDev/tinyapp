const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let char = chars[Math.floor((Math.random() * 26) + 1)];
    randomString += char;
  }
  return randomString;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
