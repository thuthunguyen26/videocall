import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin

const GoogleLoginComponent = ({onUserLogin }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Xử lý khi đăng nhập thành công
    const onGoogleLoginSuccess = (response) => {
        const token = response.credential; // Nhận token từ Google (JWT token)

        // Bạn có thể sử dụng token này để xác thực người dùng với backend
        console.log("Token:", token);

        // Gửi token và lấy thông tin người dùng từ Google
        fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
                onUserLogin(data);
            })
            .catch((err) => {
                setError("Không thể lấy thông tin người dùng");
                console.error(err);
            });
    };

    // Xử lý khi đăng nhập thất bại
    const onGoogleLoginFailure = (error) => {
        setError("Đăng nhập thất bại");
        console.error("Google login error", error);
    };

    return (
        <div>
            {user ? (
                <div>
                    <h3>Chào {user.name}!</h3>
                    <p>Email: {user.email}</p>
                    <img src={user.picture} alt="User Profile" style={{ borderRadius: "50%" }} />
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={onGoogleLoginSuccess}
                    onFailure={onGoogleLoginFailure}
                    useOneTap // Cho phép sử dụng One Tap Google Login
                />
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default GoogleLoginComponent;
