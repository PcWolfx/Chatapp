const express = require("express");
const pool = require("./db");
const cors = require("cors")
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const session = require("express-session");
const redis = require("redis");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors:{
        origin: "http://localhost:3001",
        credentials: true
    }
});


    console.log("==socket connected==");




let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
    host: "192.168.0.102",
    port: 5000,
});

const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient}),
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: false,
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
})

io.use((socket, next)=>{
    sessionMiddleware(socket.client.request, socket.client.request.res || {}, next);
})

currentSocketUsers = []; 

io.on("connection", socket =>{
    console.log("==socket=====connected==");

    socket.on("connectUser", async(username) =>{
        let currentUser = currentSocketUsers.filter(user => user.username === username);
        if(currentUser.length === 0){
            try{
                await pool.query("UPDATE users SET is_online = true WHERE username = $1", [username]);            
                currentSocketUsers.push({username: username, sockets: [socket]});
                currentUser[0]=currentSocketUsers[currentSocketUsers.length - 1];
                io.sockets.emit("refreshUsers");
            } catch(err){
                console.log(err);
            }
        }
        else{
            currentUser[0].sockets.push(socket);
        }
        console.log("connect user", currentSocketUsers)
        socket.on("disconnect", async()=>{
            if(currentUser[0]){
                if(currentUser.length > 0){
                    currentUser[0].sockets.splice(currentUser[0].sockets.indexOf(socket), 1);
                }
                if(currentUser[0].sockets.length === 0){
                    try{
                        await pool.query("UPDATE users SET is_online = false WHERE username = $1", [username]);
                        currentSocketUsers.splice(currentSocketUsers.indexOf(currentUser[0], 1))
                        io.sockets.emit("refreshUsers");
                    } catch(err){
                        console.log(err);
                    }
                }
                console.log("disconnect user", currentSocketUsers)
            }
        })
    })
})

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));
app.use(express.json());

app.get("/session", (req, res) => {
    res.json(req.session.user);
})


app.post("/register", async(req, res)=>{
    try{
        const { username, password } = req.body;
        bcrypt.hash(password, 10, async(err, hash)=>{
            await pool.query("INSERT INTO users (username, hash) VALUES($1, $2)", [username, hash]);
        })
        res.status(200).redirect(req.get("origin"));
    } catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})

app.post("/login", async(req, res)=>{
    try{
        const { username, password } = req.body;
        await pool.query("SELECT * FROM users WHERE username = $1;", [username], (err, user) => {
            if(err){
                console.log(err);
                res.status(500).send(err);
            }
            if(user.rowCount > 0){
                bcrypt.compare(password, user.rows[0].hash, async(err, successful)=>{
                    if(successful){
                        try{

                            await pool.query("UPDATE users SET is_online = true WHERE username = $1", [username]);
                        }catch(err){
                            console.log(err);
                        }
                        const userInfo = {
                            id: user.rows[0].id,  
                            username: user.rows[0].username,  
                            is_online: true
                        } 
                        req.session.user = userInfo;
                        res.status(200).redirect(req.get("origin"));
                        io.sockets.emit("refreshUsers");
                    } else {
                        res.send("Wrong username/password");
                    }
                })    
            }
            
        });
    } catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})

app.post("/logout", async(req, res)=>{
    try{
        const { username } = req.session.user;
        await pool.query("UPDATE users SET is_online = false WHERE username = $1", [username]);
        req.session.user = null;
        console.log("================================================================== ended session!")
        res.status(200).end();
        io.sockets.emit("refreshUsers");
    } catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})

app.get("/users", async(req, res)=>{
    try {
        const allUsers = await pool.query("SELECT * FROM users");
        res.json(allUsers.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

app.get("/users/:id", async(req, res)=>{
    try {
        const { id } = req.params;
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        res.json(user.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

app.delete("/users/delete/:id", async(req, res)=>{
    try {
        const { id } = req.params;
        const deleteUser = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

// mesages

app.post("/message", async(req, res)=>{
    try{
        console.log(req.session.user)
        const { message } = req.body;
        await pool.query("INSERT INTO messages (message, user_id) VALUES($1, $2)", [message, req.session.user.id]);
        res.status(200).redirect(req.get("origin"));
        io.sockets.emit("refreshMessages");
    } catch(err){
        console.log(err);
        res.status(500).send(err);
    }

})


app.get("/messages", async(req, res)=>{
    try {
        const allMessages = await pool.query("SELECT * FROM messages");
        res.json(allMessages.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})


server.listen(3000, console.log("app available on http://localhost:3000"))