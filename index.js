// index.js
const { Client, GatewayIntentBits } = require("discord.js");

// 環境変数から読み込む
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// 発言するメッセージリスト
const MESSAGES = [
  "ごみ",
  "カス",
  "この世から消えろよ",
  "お前の存在価値ないやん",
  "タヒね！"
];

if (!TOKEN || !CHANNEL_ID) {
  console.error("ERROR: DISCORD_TOKEN と CHANNEL_ID を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let running = false;
let intervalHandle = null;
let messageIndex = 0;

client.once("ready", () => {
  console.log("Bot logged in:", client.user.tag);
  startPosting(); // 起動時に自動で投稿開始
});

function startPosting() {
  if (running) return;
  running = true;
  const channel = client.channels.cache.get(CHANNEL_ID) || null;

  Promise.resolve(channel || client.channels.fetch(CHANNEL_ID))
    .then(ch => {
      intervalHandle = setInterval(async () => {
        try {
          const text = MESSAGES[messageIndex % MESSAGES.length];
          messageIndex++;
          await ch.send(text);
        } catch (err) {
          console.error("Send error:", err?.message || err);
        }
      }, 500); // 0.5秒ごと
      console.log("Posting started.");
    })
    .catch(err => console.error("Fetch channel error:", err));
}

function stopPosting() {
  if (!running) return;
  running = false;
  clearInterval(intervalHandle);
  intervalHandle = null;
  console.log("Posting stopped.");
}

client.login(TOKEN).catch(err => {
  console.error("Login failed:", err);
});
