import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../../firebase";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User has successfully signed up");

      setSuccess("User has successfully signed up.");

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(error.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCredential.user.getIdToken();

      localStorage.setItem("token", token);

      onLogin();
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(error.message);
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="auth-title">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        <p className="auth-subtitle">
          {isLogin
            ? "Login to access your mailbox"
            : "Sign up to create your mailbox"}
        </p>

        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
        >

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <button className="auth-button" type="submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>

        </form>

        <div className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            className="switch-button"
            onClick={switchMode}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Auth;
