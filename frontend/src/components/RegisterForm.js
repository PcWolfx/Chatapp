import React from 'react'
import { Link } from "react-router-dom"
import styles from "../styles/registerForm.module.css"

const checkPassword = (e) => {
    e.preventDefault();
    const form = document.getElementById("register-form");
    const pass1 = document.getElementById("password1-input");
    const pass2 = document.getElementById("password2-input");
    console.log(form);
    if(pass1.innerText === pass2.innerText){
        form.submit();
    }else{
        alert("passwords do not match");
    }
}

const RegisterForm = () => {
    return (
        <form id="register-form" className={styles["container"]} action="http://localhost:3000/register" method="post" encType="application/x-www-form-urlencoded">
            <h2 className={styles["title"]}>Register</h2>
            <input className={styles["input"]} name="username" autoComplete="username" type="text" placeholder="username"/>
            <input id="password1-input" className={styles["input"]} autoComplete="new-password" name="password"  type="password" placeholder="password"/>
            <input id="password2-input" className={styles["input"]} autoComplete="new-password" type="password"  placeholder="confirm password"/>
            <button className={styles["button"]} type="submit" onClick={(e) => checkPassword(e)}>register</button>
            <Link className={styles["log-in"]} to="/login">log in</Link>
        </form>
    )
}

export default RegisterForm
