const { name } = require("ejs");
const express = require("express");
var cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cookieParser())
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
    ID1: {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    ID2: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

  const getUserByEmail = (email) => {
    for( let user in users) {
        if (users[user].email === email) {
            return email
        } 
    }
    return null
  }
  

app.get("/register", (req, res) => {
    
    res.render("urls_register")
})

app.post("/register", (req, res) => {
    let userEmail = req.body.email
    let userPassword = req.body.password
    let userID = uuidv4()

    if (!userEmail || !userPassword ) {
        return res.status(400).send("Email or password invalid")
    }
        
    
    if (getUserByEmail(userEmail) === userEmail) {
            return res.status(400).send("Email is already registered")
        }
        
    
    users[userID] = {
        id: userID,
        email: userEmail,
        password: userPassword
    }
    
    res.redirect("/login")
})

app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    res.redirect("/register")
})

app.get("/login", (req, res) => {
    res.render("urls_login.ejs")
})

app.post("/login", (req, res) => {
    let userEmail = req.body.email
    let userPassword = req.body.password
    let userID
    for(let user in users) {
        if(users[user].email === userEmail) {
            userID = user
        }
    }

    if (!getUserByEmail(userEmail)) {
        return res.status(403).send("Email not registered")
    }
    if ( users[userID].password !== userPassword) {
        return res.status(403).send("Incorrect password")
    }

    res.cookie("user_id", userID )
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
    res.redirect(`/urls/${id}`); 
  });

app.get("/urls/new", (req, res) => {
    let id = req.cookies["user_id"]
    const templateVars = { user: users[id] }
    res.render("urls_new", templateVars);
  });

app.get("/urls/:id", (req, res) => {
    let id = req.cookies["user_id"]
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  user: users[id] };
    res.render("urls_show", templateVars);
  });

app.get("/urls", (req, res) => {
    let id = req.cookies["user_id"]
    const templateVars = { urls: urlDatabase,  user: users[id] };
    res.render("urls_index", templateVars);
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  
app.get("/", (req, res) => {
  res.redirect("/register");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
