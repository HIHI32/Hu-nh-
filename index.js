const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const ADMIN_CHAT_ID = 'YOUR_ADMIN_CHAT_ID_HERE';

let pendingVotes = {};

// Giao diện bình chọn
app.get("/vote", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

// Nhận bình chọn từ người dùng
app.post("/vote", async (req, res) => {
  const { phone, choice } = req.body;
  const requestId = Date.now().toString();

  if (!phone || !choice) {
    return res.send("Thiếu thông tin.");
  }

  pendingVotes[requestId] = { phone, choice, status: "pending" };

  const msg = Yêu cầu bình chọn:\nSĐT: ${phone}\nChọn: ${choice}\nID:${requestId}\n\nTrả lời tin nhắn này với "có" hoặc "không" để duyệt.;

  await axios.post(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
    chat_id: ADMIN_CHAT_ID,
    text: msg
  });

  res.send("Đã nhận bình chọn, vui lòng chờ xác nhận.");
});

// Nhận phản hồi từ admin
app.post("/webhook", (req, res) => {
  const message = req.body.message;

  if (message && message.text && message.chat.id.toString() === ADMIN_CHAT_ID) {
    const replyTo = message.reply_to_message;
    const text = message.text.toLowerCase().trim();

    if (replyTo && replyTo.text) {
      const parts = replyTo.text.match(/ID:(\d+)/);
      if (parts && parts[1]) {
        const requestId = parts[1];
        if (pendingVotes[requestId]) {
          pendingVotes[requestId].status = text === "có" ? "approved" : "rejected";
        }
      }
    }
  }

  res.sendStatus(200);
});

// Khởi chạy
app.listen(3000, () => {
  console.log("Server đang chạy trên cổng 3000");
});
