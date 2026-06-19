const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const { DisTube } = require("distube");
const ffmpeg = require("ffmpeg-static");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: false,
  leaveOnFinish: false,
  leaveOnStop: false,
  ffmpeg
});

client.once("ready", () => {
  console.log(`✅ Login sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = "!";

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "play") {
    const voice = message.member.voice.channel;

    if (!voice) {
      return message.reply("Masuk voice channel dulu!");
    }

    const query = args.join(" ");

    if (!query) {
      return message.reply("Masukkan judul lagu atau link.");
    }

    try {
      await client.distube.play(voice, query, {
        textChannel: message.channel,
        member: message.member
      });
    } catch (err) {
      console.log(err);
      message.reply("Gagal memutar lagu.");
    }
  }

  if (cmd === "skip") {
    client.distube.skip(message);
    message.reply("⏭ Lagu dilewati.");
  }

  if (cmd === "stop") {
    client.distube.stop(message);
    message.reply("⏹ Musik dihentikan.");
  }

  if (cmd === "queue") {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply("Queue kosong.");

    message.reply(
      queue.songs
        .map((song, i) => `${i + 1}. ${song.name}`)
        .join("\n")
    );
  }

  if (cmd === "247") {
    const voice = message.member.voice.channel;

    if (!voice) {
      return message.reply("Masuk voice channel dulu.");
    }

    await voice.join?.();

    message.reply("✅ Mode 24/7 aktif.");
  }
});

client.distube
  .on("playSong", (queue, song) => {
    queue.textChannel.send(
      `🎵 Sekarang memutar: **${song.name}**`
    );
  })
  .on("addSong", (queue, song) => {
    queue.textChannel.send(
      `➕ Ditambahkan ke queue: **${song.name}**`
    );
  })
  .on("error", (channel, error) => {
    console.log(error);
  });

client.login("TOKEN_BOT_KAMU");