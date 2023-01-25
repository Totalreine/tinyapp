const { name } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


/*function generateRandomString() {
    let id = (Math.random() + 1).toString(36).substring(7);
    return id
}*/
app.post("/login", (req, res) => {
    let user = req.body.username
    res.cookie("username", user )
    res.redirect("/urls")
})

//EDIT
app.post("/urls/:id", (req, res) => {
    let id = req.params.id
    let newURL = req.body.url
    urlDatabase[id] = newURL
    res.redirect("/urls")
})
//DELETE
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id
    delete urlDatabase[id]
    res.redirect("/urls")
})

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id]
    res.redirect(longURL);
  });

app.post("/urls", (req, res) => {
    
    let id = (Math.random() + 1).toString(36).substring(6);
    urlDatabase[id] = req.body.longURL
    res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
  });

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
