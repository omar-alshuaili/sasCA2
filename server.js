const express = require("express");
const mime = require("mime-types");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const querystring = require("querystring");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({
  host: "localhost",
  user: "root",
  password: "password@Root1",
  database: "users",
});

app.use(
  session({
    secret: "my-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Set the HttpOnly attribute
    },
  })
);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password@Root1",
  database: "users",
});

connection.connect((err) => {
  if (err) throw err;

  console.log("Connected to database");
});

app.use(express.json());

app.use(
  bodyParser.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 100000000000,
  })
);

/* THIS COULD EXPOSE OTHER FILES LIKE THE CONFIG OR THE SERVER FILE FROM THE BROWSER
YOU CAN TRY BY GOING TO http://localhost:3000/server.js

        TO PREVENT THAT USE THE CODE BELOW.

*/
// Serve static files from the 'pages' folder ONLY
app.use(express.static(path.join(__dirname, "pages")));


//this is not safe.
app.use(express.static(__dirname));



app.use(csrf());
app.use(function (req, res, next) {
  res.cookie("_csrf", req.csrfToken());
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none';");
  next();
});

//index
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/index.html");
});
//login
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/pages/login.html");
});

//signup
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/pages/signup.html");
});

//orders
app.get("/orders", (req, res) => {
  res.sendFile(__dirname + "/pages/orders.html");
});

//orders
app.get("/account", (req, res) => {
  res.sendFile(__dirname + "/pages/account.html");
});

// //js
// app.get('*.js', (req, res) => {
//     res.setHeader('Content-Type', mime.contentType('js'));
//     res.sendFile(__dirname + req.path);
//     console.log(res)
// });

/* THIS IS  THE SECURE CODE THAT PREVENTS SQL INDJECTION */

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if user exists
  const checkUserStm = "SELECT * FROM users WHERE username = ? ";
  connection.query(checkUserStm,[email], (err, users) => {
    console.log(users)
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    if (users && users.length > 0) {

      // Check login attempts
      const checkAttemptsStm = "SELECT * FROM login_attempts WHERE email = ?";
      connection.query(checkAttemptsStm, [email], (err, attempts) => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }

        if (attempts[0].attempts >= 3) {
          return res.status(403).send("Account locked");
        }
        const stm =
          "SELECT * FROM users WHERE username = ? AND password = ? "
        console.log("insecure sql statement: " + stm);

        connection.query(stm,[email,password], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send(err);
          }
          if (result && result.length > 0) {
            // Reset login attempts
            const resetAttemptsStm =
              "UPDATE login_attempts SET attempts = 0 WHERE email = ?";
            connection.query(resetAttemptsStm, [email], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send(err);
              }
            });
          } else {
            // Increment login attempts
            const incrementAttemptsStm =
              "UPDATE login_attempts SET attempts = attempts + 1 WHERE email = ?";
            connection.query(incrementAttemptsStm, [email], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send(err);
              }
              return res.status(401).send("Invalid email or password");
            });
          }
        });
      });
    } else {
      return res.status(401).send("Invalid email or password");
    }
  });
});

/* THIS IS ****NOT**** THE SECURE CODE THAT PREVENTS SQL INDJECTION */
// app.post('/login', (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const stm =
//     "SELECT * FROM users WHERE username = '" +
//     email +
//     " ' AND password = '" +
//     password +
//     "'";
//   console.log("insecure sql statement: " + stm);
//     connection.query(
//       stm,
//       (err, row) => {
        
//         if (err) {
//           console.error(err.message);
//           res.status(500).send(err.message);
//           return;
//         }

//         if (row.length === 0) {
//           res.status(401).send('Invalid email or password');
//           return;
        
//         }
//         const user = {
//           id: row[0].id,
//           username: row[0].username,
//           name: row[0].name,
//           isAdmin: row[0].role,
//         };
  
//         req.session.regenerate((err) => {
//           if (err) {
//             console.error(err);
//             return res.status(500).json(err);
//           }
//           req.session.user = user;
//           sessionStore.set(req.session.id, req.session, (err) => {
//             if (err) {
//               console.error(err);
//               return res.status(500).json(err);
//             }
//             return res.status(200).json(row[0]);

//           })
//         })
//       }
//     );
//   });

/* THIS IS ****NOT**** THE SECURE CODE THAT PREVENTS SQL INDJECTION */
app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = "user";

  const stm =
    "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";
  connection.query(stm, [name, email, password, role], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Add new record in login_attempts table
    const addAttemptStm =
      "INSERT INTO login_attempts (email, attempts) VALUES (?, ?)";
    connection.query(addAttemptStm, [email, 0], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send("User registered successfully");
    });
  });
});

/* THIS IS THE SECURE CODE THAT PREVENTS SQL INDJECTION */
// app.post("/signup", async (req, res) => {
//   const name = req.body.name;
//   const email = req.body.email;
//   let password = req.body.password;
  // const role = "user";
  // // Hash the password
  // await bcrypt
  //   .hash(password, 10)
  //   .then((hash) => {
  //     console.log("Hash ", hash);
  //     password = hash;
  //   })
  //   .catch((err) => console.error(err.message));

  // const stm =
  //   "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";

  // connection.query(stm, [name, email, password, role], (err, result) => {
  //   if (err) {
  //     return res.status(500).send(err);
  //   }
  //   res.status(200).send("User registered successfully");
  // });
// });



app.post("/orders", async (req, res) => {
  sessionStore.get(req.session.id, (err, session) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
      return;
    }

    if (!session) {
      res.status(404).json({ redirect: "/login" });
      return;
    }

    const userId = req.session.user.id;
    const isAdmin = req.session.user.isAdmin;

    let query =
      "SELECT * FROM order_details INNER JOIN orders ON order_details.order_id = orders.id";

    let productName = "";
    if (req.body.search.name != null) {
      productName = req.body.search.name.toLowerCase();

      query += " WHERE LOWER(order_details.product) = ?";
    }

    console.log(productName)

    sessionStore.get(req.session.id, (err, session) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        return;
      }

      if (!session) {
        res.status(404).json({ redirect: "/login" });
        return;
      }

      if (isAdmin != "admin") {
        query += "AND user_id = ?";
      }

      connection.query(query, [productName, userId], (err, result) => {
        if (err) {
          console.log("error: " + err);
          console.error(err);
          res.status(500).send("Internal server error");
          return;
        }
        if (result.length === 0) {
          return res
            .status(404)
            .json({ mess: "product" + productName + " does not exist! " });
        }
        res.status(200).send(result);
      });
    });
  });
});

app.post("/products", async (req, res) => {
  console.log(1);
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }
  console.log(session);
  const userId = req.session.user.id;

  sessionStore.get(userId, (err, session) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
      return;
    }

    if (!session) {
      res.redirect("/");
      return;
    }

    let query = "SELECT * FROM products";

    connection.query(query, [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        return;
      }

      res.status(200).send(result);
    });
  });
});

app.post("/account", (req, res) => {
  console.log(req.session.user);

  if (!req.session.user) {
    res.status(403).json({ redirect: "/login" });
    return;
  }

  const sessionId = req.sessionID;

  sessionStore.get(sessionId, (err, session) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }

    if (!session) {
      res.redirect("/login");
      return;
    }

    const username = req.session.user.username;
    let query = "SELECT * FROM users WHERE username = ?";

    connection.query(query, [username], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        return;
      }

      res.status(200).send(result[0]);
    });
  });
});
app.post("/change-email", (req, res) => {
  console.log(req.session.user);
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const sessionId = req.sessionID;

  sessionStore.get(sessionId, (err, session) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }

    if (!session) {
      return res.redirect("/login");
    }

    const username = req.session.user.username;
    const newUsername = req.body.email;
    console.log(username);
    let query = "UPDATE users SET username = ? WHERE username = ?;";

    connection.query(query, [newUsername, username], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
      }

      const user = {
        id: req.session.user.id,
        username: newUsername,
        name: req.session.user.name,
        isAdmin: req.session.user.role,
      };

      req.session.regenerate((err) => {
        if (err) {
          console.error(err);
          return res.status(500).json("Internal server error");
        }

        req.session.user = user;

        sessionStore.set(req.session.id, req.session, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json("Internal server error");
          }
          return res
            .status(200)
            .json({ message: "Email updated successfully" });
        });
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
