import React, { useEffect, useState, useContext } from 'react'
import { UserContext , Socket} from "../App"
import styles from "../styles/homePage.module.css"


const getUsers = async () => {
    const res = await fetch("http://localhost:3000/users", {
        method: "GET"
    })
    return res.json();
}

const getMessages = async () =>{
    const res = await fetch("http://localhost:3000/messages", {
        method: "GET"
    })
    return res.json()
}

const logout = () => {
    fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: 'include'
    }).then(()=>
        window.location.reload()
    )
}

const LoginPage = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    useEffect(()=>{
        getUsers().then(usersData => setUsers(usersData));
        getMessages().then(messages => setMessages(messages));
        const messageList = document.getElementById("message-list");
        setTimeout(() => {
            messageList.scrollTo(0, messageList.scrollHeight);
          }, 50)
        Socket.on("refreshUsers", ()=>{
            getUsers().then(usersData => {setUsers(usersData);});
        })
        
        Socket.on("refreshMessages", ()=>{
            getMessages().then(messages => setMessages(messages)).then( () => {
                messageList.scrollTo(0, messageList.scrollHeight);
            });
        })
    }, [])
    
    const getUser = (user_id) => {
        return users.filter(user => user.id === user_id)
    }


    return (
        <UserContext.Consumer>
                { user  => 
                    <div style={{ height: "100vh"}}>
                        <div className={styles["current-user-container"]}>
                            <h2 className={styles["username"]}>{user.username}</h2>
                            <a className={styles["logout"]} onClick={()=>logout()}>
                                logout
                            </a>
                        </div>
                        <div className={styles["content"]}>
                            <div className={styles["message-list-container"]}>
                                <ul id="message-list" className={styles["message-list"]}>
                                    { 
                                        messages.map(message =>{
                                            return (
                                                <li className={styles["message"]} key={message.id}>
                                                    <h3 className={styles["username"]}>{getUser(message.user_id)[0] ? getUser(message.user_id)[0].username : "unknown user"}</h3>
                                                    <p className={styles["text"]}>{message.message}</p>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                <form className={styles["form"]} action="http://localhost:3000/message" method="post" encType="application/x-www-form-urlencoded">
                                    <input className={styles["input"]} autoComplete="text" name="message" type="text"/>
                                    <button className={styles["submit"]} type="submit">send</button>
                                </form>
                            </div>
                            <ul className={styles["user-list"]}>
                                {
                                    users.map(user =>{
                                        return (
                                            <li className={styles["user"]} key={user.username}>
                                                <svg className={styles["status"]} viewBox="0 0 100 100">{ user.is_online?
                                                    <circle cx="50%" cy="50%" r="50%" fill="#2f7" />
                                                    : <circle cx="50%" cy="50%" r="50%" fill="#f23" />}
                                                </svg>
                                                <h1 className={styles["username"]}>{user.username}</h1>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                }
        </UserContext.Consumer>
    )
}

export default LoginPage
