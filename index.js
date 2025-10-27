// index.js
const { Client, GatewayIntentBits } = require("discord.js");

// 環境変数から読み込む（ReplitならSecretsに入れる）
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// 発言するメッセージリスト（好きに変えてOK）
const MESSAGES = [
  "チクタク…⏱",
  "0.5秒経過！",
  "こんにちは〜！",
  "まだ元気？",
  "ぽんっ！"
];

if (!TOKEN || !CHANNEL_ID) {
  console.error("ERROR: DISCORD_TOKEN と CHANNEL_ID を環境変数に設定してください。");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// 制御用フラグ
let running = false;
let intervalHandle = null;
let messageIndex = 0;

client.once("ready", () => {
  console.log("Bot logged in:", client.user.tag);
});

// 関数：送信を開始
function startPosting() {
  if (running) return;
  running = true;
  const channel = client.channels.cache.get(CHANNEL_ID) || null;

  // チャンネルがキャッシュに無い場合はfetch
  Promise.resolve(channel || client.channels.fetch(CHANNEL_ID))
    .then(ch => {
      intervalHandle = setInterval(async () => {
        try {
          // ここは「連続で0.5秒ごとに送信」
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

// 関数：送信を停止
function stopPosting() {
  if (!running) return;
  running = false;
  clearInterval(intervalHandle);
  intervalHandle = null;
  console.log("Posting stopped.");
}

// 管理コマンド（サーバー内で操作したい場合）
// 注意：悪用防止のため「ボットオーナーのみ」実行にしています。
const OWNER_ID = process.env.OWNER_ID || null;

client.on("messageCreate", async (msg) => {
  // ボットの自分自身のメッセージは無視
  if (msg.author.id === client.user.id) return;

  // 簡易コマンド（!start / !stop / !status）
  if (!OWNER_ID || msg.author.id === OWNER_ID) {
    const content = msg.content.trim().toLowerCase();
    if (content === "!start") {
      startPosting();
      msg.reply("0.5秒ごとの投稿を開始しました。");
    } else if (content === "!stop") {
      stopPosting();
      msg.reply("投稿を停止しました。");
    } else if (content === "!status") {
      msg.reply(`投稿状況: ${running ? "実行中" : "停止中"}`);
    }
  }
});

// ログイン
client.login(TOKEN)
  .catch(err => {
    console.error("Login failed:", err);
  });

// 🔽 起動時に自動で投稿を開始したい場合はこの1行のコメントを外す
client.once("ready", startPosting);
