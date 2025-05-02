import { useNavigate } from "react-router-dom";
import React from "react";
import "./Login.css";
import logo from "../../assets/example_image.png";


function Login() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/main");
    };

    return (
        <div className="login-background">
            <div className="login-container">
                <div className="login-image">
                    <img src={logo} alt="로고" style={{ width: "120px" }} />
                </div>
                <div className="login-form">
                    <h2>Log In</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Email Address" />
                        <button type="submit">Log In</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;