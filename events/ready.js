const { ActivityType } = require('discord.js');
const RPC = require('discord-rpc');
const fs = require("fs");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const buildTranscript = require("../transcriptGenerator");
module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        const AUTO_DELETE_TIME = 48 * 60 * 60 * 1000; // 48 Hours
        console.log(`[EVENT] Logged in as ${client.user.tag}`);

        // Discord RPC başlatma
        const rpc = new RPC.Client({ transport: 'ipc' });

        rpc.on('ready', () => {
            // Burada botunuzun Discord RPC içeriğini ayarlıyorsunuz
            rpc.setActivity({
                details: 'ROMAN XP CHEAT TICKET SYSTEM', // Discord'da görünen açıklama
                state: 'Helping users!',    // Discord'da görünen durum
                startTimestamp: new Date(),
                largeImageKey: 'bot_logo',      // Discord uygulamanızdaki büyük resim anahtarı
                smallImageKey: 'small_logo',    // Küçük resim
                instance: true
            });

            console.log('Discord RPC enabled!');
        });

        // Discord RPC girişini başlatın
        rpc.login({ clientId: 'YOUR_DISCORD_CLIENT_ID' }).catch(console.error);

        // Discord'da botun mevcut durumunu ayarlama
        client.user.setPresence({

            
            activities: [
                { 
                    name: 'ROMAN XP CHEAT',
                    type: ActivityType.Watching // Oyun durumu (Watching, Playing, etc.)
                }
            ],
            status: 'idle' // Botun durumu (idle, online, dnd, invisible)
        });
        


        const ticketsFile = "./database/tickets.json";

setInterval(async () => {

    if (!fs.existsSync(ticketsFile)) return;

    let tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));

    for (const ticket of [...tickets]) {

        if (Date.now() - ticket.createdAt < AUTO_DELETE_TIME)
    continue;
           

        try {

            const guild = client.guilds.cache.get(ticket.guildId);
            if (!guild) continue;

            const channel = guild.channels.cache.get(ticket.channelId);
            if (!channel) continue;

            const html = await buildTranscript(channel);

            const transcript = new AttachmentBuilder(
                Buffer.from(html, "utf8"),
                {
                    name: `transcript-${channel.name}.html`
                }
            );

            const user = await client.users.fetch(ticket.userId).catch(() => null);

            if (user) {

                const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("⏰ Ticket Automatically Closed")
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setDescription(`
Hello **${user.username}**,

Your support ticket has been automatically closed after **48 hours** due to inactivity.

### Ticket Information
👤 Customer: <@${ticket.userId}>
🏷 Ticket: ${channel.name}
🏠 Server: ${guild.name}

📄 Your complete HTML transcript is attached below.

Thank you for choosing **${guild.name}**.
`)
    .setFooter({
        text: guild.name,
        iconURL: guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

                await user.send({
                    embeds: [embed],
                    files: [transcript]
                }).catch(() => {});
            }

            await channel.delete().catch(() => {});

            tickets = tickets.filter(t => t.channelId !== ticket.channelId);

            fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));

        } catch (err) {
            console.log(err);
        }

    }

}, 60000);
    }
};
