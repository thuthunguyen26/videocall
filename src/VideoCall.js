import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import "./VideoCall.css";
import { FaCopy } from "react-icons/fa"; // Import icon sao chép từ react-icons

export default function VideoCall() {
  const callFrame = useRef(null);
  const videoContainerRef = useRef(null); // 🔹 Thêm ref cho container chứa video
  const [roomUrl, setRoomUrl] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false); // Thêm trạng thái để theo dõi đã sao chép hay chưa

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

    if (!callFrame.current) {
      callFrame.current = DailyIframe.createFrame(videoContainerRef.current, {
        iframeStyle: { width: "100%", height: "500px", border: "none" },
      });
    }

    callFrame.current.join({ url: roomUrl });
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

  return (
    <div className="video-call-container">
      <h2 className="title">Nhóm 5 Thứ 4 Ca 3</h2>
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
      
      {/* Video container */}
      <div ref={videoContainerRef} className="video-container" />
      
      {joined && <button className="btn leave-room-btn" onClick={() => callFrame.current?.leave()}>Rời phòng</button>}
    </div>
  );
}
