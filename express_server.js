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
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
    },
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
    let loggedIn = req.cookies["user_id"]
    if (!loggedIn) {
        res.render("urls_register")
    } else {
        res.redirect("/urls")
    }
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
    res.redirect("/login")
})

app.get("/login", (req, res) => {
    let loggedIn = req.cookies["user_id"]
    if (!loggedIn) {
        res.render("urls_login.ejs")
    } else {
        res.redirect("/urls")
    }
    
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
    let userID = req.cookies["user_id"]
    let id = req.params.id
    let newURL = req.body.url
    if (urlDatabase[req.params.id] === undefined) {
        res.render("urls_wrongId")
    }

    if (urlDatabase[req.params.id].userID !== userID) {
        res.render("urls_notBelongToID")
    }

    if (!userID) {
        res.render("urls_notLoggedIn")
    } else {
        urlDatabase[id].longURL = newURL
        res.redirect("/urls")
    }

   
})
//DELETE
app.post("/urls/:id/delete", (req, res) => {
    let userID = req.cookies["user_id"]
    const id = req.params.id

    if (urlDatabase[req.params.id] === undefined) {
        res.render("urls_wrongId")
    }

    if (urlDatabase[req.params.id].userID !== userID) {
        res.render("urls_notBelongToID")
    }

    if (!userID) {
        res.render("urls_notLoggedIn")
    } else {
        delete urlDatabase[id]
        res.redirect("/urls")
    }

   
})

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL
    if(longURL === undefined) {
        res.render("urls_wrongId")
    } else {
        res.redirect(longURL);
    }
    
  });

app.post("/urls", (req, res) => {
    let id = (Math.random() + 1).toString(36).substring(6);
    let loggedIn = req.cookies["user_id"] 
    if(!loggedIn) {
        res.render("urls_forbidden")
    } else {
        urlDatabase[id] = {
            longURL: req.body.longURL,
            userID: loggedIn
        }
        res.redirect(`/urls/${id}`); 
        
    }
    
  });

app.get("/urls/new", (req, res) => {
    let id = req.cookies["user_id"]
    const templateVars = { user: users[id] }
    if(!id) {
        res.redirect("/login")
    } else {
        res.render("urls_new", templateVars);
    }
        
  });

app.get("/urls/:id", (req, res) => {
    let id = req.cookies["user_id"]
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL,  user: users[id] };
    if(!id) {
        res.render("urls_notLoggedIn")
    } else if(urlDatabase[req.params.id].userID !== id ) {
        res.render("urls_notBelongToID")
    }
    else {
        res.render("urls_show", templateVars);
    }
    
  });

  const urlsForUser = (id) => {
   let newDB = {}
   for(let key in urlDatabase) {
    if(urlDatabase[key].userID === id) {
        newDB[key] = urlDatabase[key]
    }

   }
   return newDB
  }
    
    

app.get("/urls", (req, res) => {
    let id = req.cookies["user_id"]
    let filteredDatabe = urlsForUser(id)
    const templateVars = { urls: filteredDatabe,  user: users[id] };
    if(!id) {
        res.render("urls_notLoggedIn")
    } else {
        res.render("urls_index", templateVars);
    }
    
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
