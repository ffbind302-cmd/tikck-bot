const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { DeployCommands } = require('./deploy-commands');

const express = require("express");
const path = require("path");
const fs = require('fs');
require('colors');

const app = express();

app.use("/transcripts", express.static(path.join(__dirname, "transcripts")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Web Server Running On Port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

(async () => {

    await DeployCommands();

    // Load Events
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {

        const event = require(`./events/${file}`);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }

    }

    // Load Commands
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

        console.log(
            `[COMMAND] ${command[0].padEnd(commandNameLength)} | ${'Loaded!'.green}`.gray
        );

    }

    if (!fs.existsSync('./errors')) {
        fs.mkdirSync('./errors');
    }

    if (!fs.existsSync('./database')) {
        fs.mkdirSync('./database');
    }

    if (!fs.existsSync('./transcripts')) {
        fs.mkdirSync('./transcripts');
    }

    client.login(token);

})();