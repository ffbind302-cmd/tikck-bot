const fs = require("fs");
const path = require("path");


async function generateTranscript(channel) {

    const messages = await channel.messages.fetch({ limit: 100 });

    let htmlMessages = "";


    messages.reverse().forEach(msg => {


        let attachments = "";


        if (msg.attachments.size > 0) {

            msg.attachments.forEach(file => {

                attachments += `
                
                <div class="attachment">

                    <div class="fileIcon">
                        📄
                    </div>

                    <div>

                        <div class="fileName">
                            ${file.name}
                        </div>

                        <div class="fileSize">
                            Attachment
                        </div>

                    </div>

                </div>

                `;

            });

        }



        htmlMessages += `


<div class="messageBox">


<img class="avatar"
src="${msg.author.displayAvatarURL({
    extension: "png",
    size: 128
})}">


<div class="messageContent">


<div class="messageHeader">


<div class="username">

${msg.author.username}

</div>


<div class="time">

${msg.createdAt.toLocaleString()}

</div>


</div>



<div class="messageText">

${msg.content || "<i>No text message</i>"}

</div>


${attachments}


</div>


</div>


`;



    });


    return htmlMessages;

}




async function buildTranscript(channel) {


    const htmlTemplate = fs.readFileSync(

        path.join(__dirname, "templates", "transcript.html"),

        "utf8"

    );


    const messages = await generateTranscript(channel);



    const ticketId = channel.id;



    const owner = channel.topic
        ? channel.topic.split(" ")[0]
        : "Unknown";



    return htmlTemplate

    .replace(/{{SERVER_NAME}}/g, channel.guild.name)

    .replace(
        /{{SERVER_ICON}}/g,
        channel.guild.iconURL({
            extension:"png",
            size:256
        }) || ""
    )


    .replace(/{{CHANNEL}}/g, channel.name)


    .replace(/{{TICKET_ID}}/g, ticketId)


    .replace(/{{USER}}/g, owner)


    .replace(
        /{{OPEN_TIME}}/g,
        new Date(channel.createdTimestamp).toLocaleString()
    )


    .replace(
        /{{CLOSE_TIME}}/g,
        new Date().toLocaleString()
    )


    .replace(
        /{{MESSAGES}}/g,
        messages
    )


    // पुराने खाली placeholders हटाने के लिए

    .replace(/{{USER_FIRST}}/g,"")

    .replace(/{{MESSAGE_TIME}}/g,"")

    .replace(/{{MESSAGE}}/g,"")

    .replace(/{{BOT_TIME}}/g,"")

    .replace(/{{BOT_MESSAGE}}/g,"")

    .replace(/{{ATTACH_TIME}}/g,"")

    .replace(/{{FILE_NAME}}/g,"")

    .replace(/{{FILE_SIZE}}/g,"");


}



module.exports = buildTranscript;