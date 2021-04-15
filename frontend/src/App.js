import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import { io } from "socket.io-client";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import './styles/App.css';

export const UserContext = React.createContext();

export const Socket = io("http://localhost:3000", {withCredentials: true, "disconnect on unload": true })

function App() {
    const [user, setUser] = useState(null);
    // const {current: socket} = useRef(io("http://localhost:3000", {withCredentials: true, query: `username=user`}));
    
    // get user session data on mount
    useEffect(()=>{
        if(!user)
        {
            fetch("http://localhost:3000/session", {
                method: "GET",
                credentials: 'include'
            }).then(res => res.json()).then(user => {
                if(user){
                    setUser(user);
                    Socket.emit("connectUser", user.username)
                }
                else{
                    setUser(null);
                }
            })
        }
    }, [])
    
    return (
        <Router>
            <UserContext.Provider value={user}>
                    <Switch>
                    <Route exact path="/">
                        {
                            user ? <HomePage/> : <LoginPage/>
                        }
                    </Route>
                    {
                        user ? <Redirect to="/"/> : 
                        <React.Fragment><Route path="/register">
                            <RegisterPage/>
                        </Route>
                        <Route path="/login">
                            <LoginPage/>
                        </Route></React.Fragment>
                    }
                    </Switch>
            </UserContext.Provider>
        </Router>
    );
}

export default App;
