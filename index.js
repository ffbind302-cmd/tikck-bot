const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { DeployCommands } = require('./deploy-commands');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
] });
const fs = require('fs');
require('colors');
const buildTranscript = require("./transcriptGenerator");
const { AttachmentBuilder } = require("discord.js");
(async () => {
    await DeployCommands();

    // Tüm komutları işleyin
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); 
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    // Tüm komutları işleyin
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    let commandNameLength = 0;
    for (const command of client.commands) {
        if (command[0].length > commandNameLength) {
            commandNameLength = command[0].length;
        }
    }

    for (const command of client.commands) {
        console.log(`[COMMAND] ${command[0].padEnd(commandNameLength)} | ${'Loaded!'.green}`.gray); 
    }

    if (!fs.existsSync('./errors')) {
        fs.mkdirSync('./errors');
    }

    if (!fs.existsSync('./database')) {
        fs.mkdirSync('./database');
    }
 setInterval(async () => {

    const ticketsFile = "./database/tickets.json";

    if (!fs.existsSync(ticketsFile)) return;

    let tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));

    const remaining = [];

    for (const ticket of tickets) {

        try {

            if (Date.now() - ticket.createdAt < 48 * 60 * 60 * 1000) {
                remaining.push(ticket);
                continue;
            }

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
                await user.send({
                    content: "⏰ Your ticket has been automatically closed after 48 hours.",
                    files: [transcript]
                }).catch(() => {});
            }

            await channel.delete().catch(() => {});

        } catch (err) {
            console.log(err);
            remaining.push(ticket);
        }

    }

    fs.writeFileSync(
        ticketsFile,
        JSON.stringify(remaining, null, 2)
    );

}, 5 * 60 * 1000);
    client.login(token); // Discord Giriş
})();