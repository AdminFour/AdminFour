// ใช้ ES module
import { Client, GatewayIntentBits, EmbedBuilder, Partials, Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// สร้าง client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// Express server สำหรับ UptimeRobot
const app = express();
app.get('/', (req, res) => res.send('Bot is live!'));
app.listen(3000, () => console.log('✅ Website is live'));

// เมื่อบอทออนไลน์
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ส่ง Embed ต้อนรับเมื่อมีผู้ใช้ใหม่
client.on('guildMemberAdd', async member => {
  const channelId = '1370090269671952424'; // 🔁 เปลี่ยนเป็น Channel ID จริงของคุณ
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle('🎉 ยินดีต้อนรับ!')
    .setDescription(`ยินดีต้อนรับ <@${member.id}> เข้าสู่เซิร์ฟเวอร์!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  channel.send({ embeds: [welcomeEmbed] });
});

// ฟังข้อความจากผู้ใช้
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ตรวจจับเลขห้อง เช่น XVN645
  const roomCodeRegex = /^[A-Z0-9]{6}$/;
  const code = message.content.trim().toUpperCase();

  if (roomCodeRegex.test(code)) {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle(`🎮 เจอห้องแล้ว: ${code}`)
      .setDescription(`มีใครสนใจเข้าห้องเกมนี้ไหม?\nรหัสห้อง: **${code}**\n\n💬 รีบเข้าก่อนเต็ม!`)
      .setFooter({ text: 'ระบบค้นหาห้องเล่นเกมโดย Valorant Bot' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
    return;
  }

  // คำสั่ง !rank สำหรับเลือกบทบาท
  if (message.content === '!rank') {
    const ranks = [
      '🪙 Iron', '🪨 Bronze', '🧱 Silver',
      '🥉 Gold', 'Platinum', 'Diamond',
      'Ascendant', 'Immortal', 'Radiant'
    ];

    const buttons = ranks.map(rank =>
      new ButtonBuilder()
        .setCustomId(`rank_${rank}`)
        .setLabel(rank)
        .setStyle(ButtonStyle.Primary)
    );

    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
    }

    await message.channel.send({
      content: '🎖️ กรุณาเลือกยศของคุณ:',
      components: rows
    });
  }
});

// เมื่อมีการกดปุ่มเลือก Rank
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('rank_')) {
    const selectedRank = interaction.customId.replace('rank_', '');
    const role = interaction.guild.roles.cache.find(r => r.name === selectedRank);

    if (!role) {
      return interaction.reply({ content: `❌ ไม่พบ Role ชื่อ "${selectedRank}"`, ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) return;

    await member.roles.add(role);
    await interaction.reply({ content: `✅ เพิ่ม Role **${selectedRank}** ให้คุณแล้ว`, ephemeral: true });
  }
});

// เริ่มรันบอท
client.login(process.env.TOKEN);
