const express = require('express');
const mime = require('mime-types');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const querystring = require('querystring');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

const sessionStore = new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: 'password@Root1',
    database: 'users',
});

app.use(session({
    secret: 'my-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password@Root1',
    database: 'users'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});


app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '5000mb', extended: true, parameterLimit: 100000000000 }));

//css
app.use(express.static(__dirname + '/'));

//index  
app.get('/', (req, res) => {

    res.sendFile(__dirname + '/pages/index.html');
});
//login 
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/pages/login.html');
});

//signup 
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/pages/signup.html');
});


//orders 
app.get('/orders', (req, res) => {
    res.sendFile(__dirname + '/pages/orders.html');
});


// //js
// app.get('*.js', (req, res) => {
//     res.setHeader('Content-Type', mime.contentType('js'));
//     res.sendFile(__dirname + req.path);
//     console.log(res)
// });







/* THIS IS ****NOT**** THE SECURE CODE THAT PREVENTS SQL INDJECTION */
app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const stm = "SELECT * FROM users WHERE username = '" + email + " ' AND password = '" + password + "'";
    console.log('insecure sql statement: ' + stm);

    connection.query(stm, (err, result) => {
        if (err) {

            return res.status(500).send(err);
        }
        if (result && result.length > 0) {
            const user = {
                id: result[0].id,
                username: result[0].username,
                name: result[0].name,
                isAdmin: result[0].role
            };

            req.session.regenerate(err => {
                if (err) {
                    console.error(err);
                    return res.status(500).json('Internal server error');
                }
                req.session.user = user;
                sessionStore.set(req.session.id, req.session, err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json('Internal server error');
                    }
                    return res.status(200).json(result[0]);
                });
            });
        }
        else {
            return res.status(401).send('Invalid email or password')
        }
    });
});




/* THIS IS THE SECURE CODE THAT PREVENTS SQL INDJECTION */
// app.post('/login', (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     console.log('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
//     db.get(
//       'SELECT * FROM users WHERE email = ? AND password = ?',
//       [email, password],
//       (err, row) => {
//         if (err) {
//           console.error(err.message);
//           res.status(500).send('Internal server error');
//           return;
//         }

//         if (!row) {
//           res.status(401).send('Invalid email or password');
//           return;
//         }

//         // User was found, do something here
//         res.send('Login successful');
//       }
//     );
//   });

app.post('/orders', async (req, res) => {
   console.log(1)
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    const userId = req.session.user.id;
    const isAdmin = req.session.user.isAdmin;
    console.log(userId)


    sessionStore.get(userId, (err, session) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
            return;
        }
        console.log(session)
        if (!session) {
            res.redirect('/');
            return;
        }

        let query = 'SELECT * FROM order_details';

        if (isAdmin != 'admin') {
            query += ' WHERE user_id = ?';
        }

        connection.query(query, [userId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal server error');
                return;
            }

            res.status(200).send(result);
        });
    });
});



app.post('/products', async (req, res) => {
    console.log(1)
     if (!req.session.user) {
         res.redirect('/login');
         return;
     }
     const userId = req.session.user.id;
     console.log(userId)
 
 
     sessionStore.get(userId, (err, session) => {
         if (err) {
             console.error(err);
             res.status(500).send('Internal server error');
             return;
         }
         console.log(session)
         if (!session) {
             res.redirect('/');
             return;
         }
 
         let query = 'SELECT * FROM products';
 
         
 
         connection.query(query, [userId], (err, result) => {
             if (err) {
                 console.error(err);
                 res.status(500).send('Internal server error');
                 return;
             }
 
             res.status(200).send(result);
         });
     });
 });





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

