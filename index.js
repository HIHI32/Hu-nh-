const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // Để đọc form html gửi lên
app.use(bodyParser.json());

const BOT_TOKEN = '7804365124:AAF4543inikakslfqqDd2mLMkYNFfqCZuHc';
const ADMIN_CHAT_ID = '6030982150';

let pendingVotes = {};

app.get('/vote', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/vote', async (req, res) => {
  const { phone, choice } = req.body;
  const requestId = Date.now().toString();

  pendingVotes[requestId] = { phone, choice, status: 'pending' };

  const msg = Yêu cầu bình chọn:\nSĐT: ${phone}\nChọn: ${choice}\nID:${requestId}\n\nTrả lời tin nhắn này với "có" hoặc "không" để duyệt.;

  await axios.get(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
    params: {
      chat_id: ADMIN_CHAT_ID,
      text: msg,
    },
  });

  res.send('Đã nhận bình chọn');
});

app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.chat && message.chat.id == ADMIN_CHAT_ID) {
    const text = message.text.toLowerCase().trim();
    const replyTo = message.reply_to_message;
    if (replyTo && replyTo.text) {
      const parts = replyTo.text.match(/ID:(\d+)/);
      if (parts && parts[1]) {
        const requestId = parts[1];
        if (pendingVotes[requestId]) {
          pendingVotes[requestId].status = (text === 'có') ? 'approved' : 'rejected';

          // Gửi phản hồi cho người dùng (tuỳ chọn)
          await axios.get(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
            params: {
              chat_id: ADMIN_CHAT_ID,
              text: Phản hồi cho ID ${requestId}: ${pendingVotes[requestId].status},
            },
          });
        }
      }
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server đang chạy trên cổng 3000');
});
