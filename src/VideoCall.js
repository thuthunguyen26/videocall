import { use, useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import "./VideoCall.css";
import { FaCopy } from "react-icons/fa"; // Import icon sao chép từ react-icons

import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLogin from "./LoginGoogle";
export default function VideoCall() {
    const callFrame = useRef(null);
    const videoContainerRef = useRef(null); // 🔹 Thêm ref cho container chứa video
    const [roomUrl, setRoomUrl] = useState("");
    const [joined, setJoined] = useState(false);
    const [copied, setCopied] = useState(false); // Thêm trạng thái để theo dõi đã sao chép hay chưa
    const [user, setUser] = useState(null);
    const YOUR_GOOGLE_CLIENT_ID = "157931370612-fckv2oo5gqbub4sq1o4m2opj7tqeatcn.apps.googleusercontent.com";
    async function createRoom() {
        try {
            const response = await fetch("https://api.daily.co/v1/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 39549d7da6965523c1f23955c4730513f29db8f1d04af3ec1fed85a517c063e8", // 🔹 Thay YOUR_API_KEY bằng API Key của bạn
                },
                body: JSON.stringify({
                    privacy: "public",
                    properties: {
                        enable_chat: true,
                        enable_screenshare: true,
                        exp: Math.floor(Date.now() / 1000) + 3600,
                    },
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error("Lỗi API:", data);
                alert(`Lỗi tạo phòng: ${data.error || "Không xác định"}`);
                return null;
            }

            return data.url;
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Lỗi kết nối API");
            return null;
        }
    }

    async function handleCreateRoom() {
        const newRoomUrl = await createRoom();
        if (!newRoomUrl) {
            alert("Không thể tạo phòng, vui lòng thử lại!");
            return;
        }
        setRoomUrl(newRoomUrl);
    }

    function joinMeeting() {
        if (!roomUrl) return alert("Vui lòng nhập URL phòng!");
        if (!user) return alert("Vui lòng đăng nhập để tham gia cuộc gọi!");
    
        if (!callFrame.current) {
            callFrame.current = DailyIframe.createFrame(videoContainerRef.current, {
                iframeStyle: { width: "100%", height: "500px", border: "none" },
            });
        }
    
        callFrame.current.join({
            url: roomUrl,
            userName: user.name // 🔹 Truyền tên user từ Google vào Daily.co
        });
    
        callFrame.current.on("joined-meeting", () => setJoined(true));
        callFrame.current.on("left-meeting", () => {
            setJoined(false);
            callFrame.current.destroy();
            callFrame.current = null;
        });
    }
    

    function copyRoomUrl() {
        navigator.clipboard.writeText(roomUrl)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset trạng thái sao chép sau 2 giây
            })
            .catch(err => {
                console.error("Lỗi khi sao chép URL:", err);
                alert("Không thể sao chép URL!");
            });
    }

    const handleUserData = (user) => {
        console.log("Google login successful", user);
        setUser(user);
    }
    return (
        <div className="video-call-container">
            <img src={user ? user.picture : "Unknow"} />
            <h3>Tai khoan: {user ? user.name : ""}</h3>
            <h2 className="title">Nhóm 5 Thứ 4 Ca 3</h2>
            {!user ? (
                <div className="login-buttons">
                    <GoogleOAuthProvider clientId={YOUR_GOOGLE_CLIENT_ID}>
                        <GoogleLogin
                            onUserLogin={handleUserData}
                        />
                    </GoogleOAuthProvider>
                    {/* <GithubLogin
            onSuccess={onGithubLoginSuccess}
            onFailure={(error) => console.error("GitHub login error", error)}
          /> */}
                </div>
            ) :
                (
                    <div className="controls">
                        <button className="btn create-room-btn" onClick={handleCreateRoom}>Tạo phòng mới</button>
                        <input
                            className="input-room-url"
                            type="text"
                            placeholder="Nhập URL phòng..."
                            value={roomUrl}
                            onChange={(e) => setRoomUrl(e.target.value)}
                        />

                        {/* Nút sao chép URL */}
                        {roomUrl && (
                            <button className="btn copy-url-btn" onClick={copyRoomUrl}>
                                <FaCopy /> {copied ? "Đã sao chép!" : "Sao chép URL phòng"}
                            </button>
                        )}
                        <button className="btn join-room-btn" onClick={joinMeeting}>Tham gia phòng</button>
                    </div>
                )}

            {/* Video container */}
            <div ref={videoContainerRef} className="video-container" />

            {joined && <button className="btn leave-room-btn" onClick={() => callFrame.current?.leave()}>Rời phòng</button>}
        </div>
    );
}
