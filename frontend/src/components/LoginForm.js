import React from 'react'
import { Link } from "react-router-dom"
import styles from "../styles/loginForm.module.css"

const sumbitForm = (e) =>{
    e.preventDefault();
    const loginForm = document.getElementById('login-form');
    loginForm.submit();
    // window.location.replace("http://localhost:3001");
}

const LoginForm = () => {
    return (
        <form id="login-form" className={styles["container"]}  action="http://localhost:3000/login" method="post" encType="application/x-www-form-urlencoded">
            <h2 className={styles["title"]}>Login</h2>
            <input className={styles["input"]} autoComplete="new-password" name="username" type="text" placeholder="username"/>
            <input className={styles["input"]} autoComplete="new-password" name="password" type="password" placeholder="password"/>
            <button className={styles["button"]} type="submit" onClick={(e)=>sumbitForm(e)}>login</button>
            <Link className={styles["register"]} to="/register">register</Link>
        </form>
    )
}

export default LoginForm
