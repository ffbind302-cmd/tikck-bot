const fs = require("fs");
const path = require("path");

async function generateTranscript(channel) {

    const messages = await channel.messages.fetch({ limit: 100 });

    let htmlMessages = "";

    messages.reverse().forEach(msg => {

        htmlMessages += `
<div class="message">

    <img class="avatar" src="${msg.author.displayAvatarURL({ extension: "png", size: 128 })}">

    <div class="content">

        <div class="top">

            <span class="username">${msg.author.username}</span>

            <span class="time">${msg.createdAt.toLocaleString()}</span>

        </div>

        <div class="bubble">
            ${msg.content || "<i>No text</i>"}
        </div>

    </div>

</div>
`;

    });

    return htmlMessages;

} // ✅ generateTranscript yahan close hoga

async function buildTranscript(channel) {

    const htmlTemplate = fs.readFileSync(
        path.join(__dirname, "templates", "transcript.html"),
        "utf8"
    );

    const messages = await generateTranscript(channel);

    return htmlTemplate
        .replace(/{{SERVER_NAME}}/g, channel.guild.name)
        .replace(/{{SERVER_ICON}}/g, channel.guild.iconURL({ extension: "png", size: 256 }) || "")
        .replace(/{{CHANNEL}}/g, channel.name)
        .replace(/{{USER}}/g, channel.topic ? channel.topic.split(" ")[0] : "Unknown")
        .replace(/{{OPEN_TIME}}/g, new Date(channel.createdTimestamp).toLocaleString())
        .replace(/{{CLOSE_TIME}}/g, new Date().toLocaleString())
        .replace(/{{MESSAGES}}/g, messages);

}

module.exports = buildTranscript;