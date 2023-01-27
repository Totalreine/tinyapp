
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const getUserByEmail = require("./helper")
const { v4: uuidv4 } = require('uuid');
const app = express();

const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: 'session',
    keys: ["supersecret!!"]

}))

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


app.get("/register", (req, res) => {
    let loggedIn = req.session.user_id
    if (!loggedIn) {
        res.render("urls_register")
    } else {
        res.redirect("/urls")
    }
})

app.post("/register", (req, res) => {
    let userEmail = req.body.email
    let userPassword = req.body.password
    const hashedPassword = bcrypt.hashSync(userPassword, 10);
    let userID = uuidv4()

    if (!userEmail || !userPassword) {
        return res.status(400).send("Email or password invalid")
    }


    if (getUserByEmail(userEmail, users) === userEmail) {
        return res.status(400).send("Email is already registered")
    }


    users[userID] = {
        id: userID,
        email: userEmail,
        password: hashedPassword
    }

    res.redirect("/login")
})

app.post("/logout", (req, res) => {
    req.session = null
    res.redirect("/login")
})

app.get("/login", (req, res) => {
    let loggedIn = req.session.user_id
    if (!loggedIn) {
        res.render("urls_login.ejs")
    } else {
        res.redirect("/urls")
    }

})

app.post("/login", (req, res) => {
    let userEmail = req.body.email
    let userPassword = req.body.password
    let hashedPassword
    let userID
    for (let user in users) {
        if (users[user].email === userEmail) {
            userID = user
            hashedPassword = users[user].password
        }
    }

    if (!getUserByEmail(userEmail, users)) {
        return res.status(403).send("Email not registered")
    }
    if (!bcrypt.compareSync(userPassword, hashedPassword)) {
        return res.status(403).send("Incorrect password")
    }

    req.session.user_id = userID;
    res.redirect("/urls")
})


app.post("/urls/:id", (req, res) => {
    let userID = req.session.user_id
    let id = req.params.id
    let newURL = req.body.url
    if (urlDatabase[id] === undefined) {
        res.render("urls_wrongId")
    }

    if (urlDatabase[id].userID !== userID) {
        res.render("urls_notBelongToID")
    }

    if (!userID) {
        res.render("urls_notLoggedIn")
    } else {
        urlDatabase[id].longURL = newURL
        res.redirect("/urls")
    }


})

app.post("/urls/:id/delete", (req, res) => {
    let userID = req.session.user_id
    let id = req.params.id

    if (urlDatabase[id] === undefined) {
        res.render("urls_wrongId")
    }

    if (urlDatabase[id].userID !== userID) {
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
    const id = urlDatabase[req.params.id]
    if (id === undefined) {
        res.render("urls_wrongId")
    } else {
        res.redirect(id.longURL);
    }

});

app.post("/urls", (req, res) => {
    let id = (Math.random() + 1).toString(36).substring(6);
    let loggedIn = req.session.user_id
    if (!loggedIn) {
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
    console.log(users)
    let id = req.session.user_id
    const templateVars = { user: users[id] }
    if (!id) {
        res.redirect("/login")
    } else {
        res.render("urls_new", templateVars);
    }

});

app.get("/urls/:id", (req, res) => {
    console.log(urlDatabase)
    let userID = req.session.user_id
    let id = req.params.id
    const templateVars = { id: id, url: urlDatabase[id],  user: users[userID] };
    if (!userID) {
        res.render("urls_notLoggedIn")
    } else if (urlDatabase[id] === undefined) {
        res.render("urls_wrongId")
    } else if (urlDatabase[id].userID !== userID) {
        res.render("urls_notBelongToID")
    } else {
        res.render("urls_show", templateVars);
    }

});

const urlsForUser = (id) => {
    let userURLS = {}
    for (let key in urlDatabase) {
        if (urlDatabase[key].userID === id) {
            userURLS[key] = urlDatabase[key]
        }

    }
    return userURLS
}



app.get("/urls", (req, res) => {
    let userID = req.session.user_id
    let filteredDatabe = urlsForUser(userID)
    const templateVars = { urls: filteredDatabe,  user: users[userID] };
    if (!userID) {
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
