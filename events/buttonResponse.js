const {
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const fs = require('fs');
const buildTranscript = require('../transcriptGenerator');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
       if (
    !interaction.isButton() &&
    !interaction.isStringSelectMenu() &&
    !interaction.isModalSubmit()
) return;

        let button = interaction.customId;
        const customId = interaction.customId;
        const value = interaction.values ? interaction.values[0] : null;
        // =======================
// SELECT MENU
// =======================

if (interaction.isStringSelectMenu()) {

    if (interaction.customId !== "ticket_menu") return;

    if (interaction.values[0] === "buy") {

        const modal = new ModalBuilder()
            .setCustomId("buy_modal")
            .setTitle("Purchase Ticket");

        const product = new TextInputBuilder()
            .setCustomId("product")
            .setLabel("Product Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const payment = new TextInputBuilder()
            .setCustomId("payment")
            .setLabel("Payment Method")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const duration = new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Duration")
            .setPlaceholder("15 Days / 30 Days / 2 Months / Lifetime")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(product),
            new ActionRowBuilder().addComponents(payment),
            new ActionRowBuilder().addComponents(duration)
        );

        return interaction.showModal(modal);

    }

   if (interaction.values[0] === "support") {

    
    button = "create_ticket";

}

}
        const user = interaction.user;
        const guild = interaction.guild;

        const date = JSON.parse(fs.readFileSync(`./database/${guild.id}.json`));
const staffRole = date.role;
const supportCategory = date.support || date.open;
const buyCategory = date.buy || date.open;
const closeCategory = date.close;

        const errorEmbed = new EmbedBuilder()
            .setTitle('⚠️ Error')
            .setColor('#FF0000')
            .setTimestamp();

        if (!guild.roles.cache.get(staffRole)) {
            errorEmbed.setDescription('Staff role was deleted.\nBotu yeniden kurmak için lütfen `/setup` komutunu kullanın.');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

       if (
    !guild.channels.cache.get(supportCategory) ||
    !guild.channels.cache.get(buyCategory)
) {
    errorEmbed.setDescription(
        'Support or Buy category was deleted.\nPlease use `/setup` again.'
    );

    return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
    });
}

        if (!guild.channels.cache.get(closeCategory)) {
            errorEmbed.setDescription('The closed ticket category has been deleted.\nPlease use the `/setup` command to configure the bot again.');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
// =======================
// BUY MODAL SUBMIT
// =======================

if (interaction.isModalSubmit()) {

    if (interaction.customId !== "buy_modal") return;

    const product = interaction.fields.getTextInputValue("product");
    const payment = interaction.fields.getTextInputValue("payment");
    const duration = interaction.fields.getTextInputValue("duration");

    const purchase = {
        product,
        payment,
        duration
    };

    const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: buyCategory,
        topic: `${user.username} ${user.id}`,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: PermissionFlagsBits.ViewChannel
            },
            {
                id: user.id,
                allow: PermissionFlagsBits.ViewChannel
            },
            {
                id: staffRole,
                allow: PermissionFlagsBits.ViewChannel
            }
        ]
    });

    const ticketEmbed = new EmbedBuilder()
        .setTitle("🛒 Purchase Ticket")
        .setDescription(`
   👋 Hello <@${user.id}>

**Product:** ${purchase.product}
**Payment:** ${purchase.payment}
**Duration:** ${purchase.duration}

<@&${staffRole}> will reply shortly.
`)
        .setColor("#6104b9");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("📩 Close Ticket")
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        embeds: [ticketEmbed],
        components: [row]
    });

    return interaction.reply({
    content: `✅ Your purchase ticket was created: ${channel}`,
    ephemeral: true
});

} // <-- BUY MODAL yaha close hoga
  

if (button === "create_ticket") {

    const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: supportCategory,
        topic: `${user.username} ${user.id}`,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: PermissionFlagsBits.ViewChannel
            },
            {
                id: user.id,
                allow: PermissionFlagsBits.ViewChann
            },
            {
                id: staffRole,
                allow: PermissionFlagsBits.ViewChannel
            }
        ]
    });

    const ticketEmbed = new EmbedBuilder()
        .setTitle("🎫 Support Ticket")
        .setDescription(`
👋 Hello <@${user.id}>

Please write the reason for opening this ticket.

<@&${staffRole}> will reply shortly.
`)
        .setColor("#6104b9");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("📩 Close Ticket")
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        embeds: [ticketEmbed],
        components: [row]
    });

    return interaction.reply({
        content: `✅ Your support ticket was created: ${channel}`,
        ephemeral: true
    });

}

else if (button == "close_ticket") {

    const isStaff = interaction.member.roles.cache.has(staffRole);
    const isOwner = interaction.guild.ownerId === interaction.user.id;

    if (!isStaff && !isOwner) {
        errorEmbed.setDescription("❌ Only staff members or the server owner can close tickets.");
        return interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Support System')
                .setDescription(`Hello <@${user.id}>, Are you sure you want to close this ticket?`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close_ticket')
                        .setLabel('✅  Yes')  // Son tırnak işareti eklendi.
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel_close_ticket')
                        .setLabel('❌ No')
                        .setStyle(ButtonStyle.Danger)
                );
                
        await interaction.update({ embeds: [ticketEmbed], components: [row] });

} else if (button == 'confirm_close_ticket') {

    const channel = interaction.channel;

   const html = await buildTranscript(channel);

const transcript = new AttachmentBuilder(
    Buffer.from(html, "utf8"),
    {
        name: `${channel.name}.html`
    }
);

    const username = channel.topic.split(' ')[0];
const userId = channel.topic.split(' ')[1];

const ticketOwner = await client.users.fetch(userId).catch(() => null);

if (ticketOwner) {
    await ticketOwner.send({
        content: '📄 Here is your ticket transcript.',
        files: [transcript]
    }).catch(() => {});
}

const ticketEmbed = new EmbedBuilder()
    .setTitle('🎫 Support System ')
    .setDescription(`Ticket closed by <@${user.id}>.`)
    .setColor('#e00000')
    .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
    .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('delete_ticket')
                .setLabel('🗑️ Delete')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('reopen_ticket')
                .setLabel('🔓 Back')
                .setStyle(ButtonStyle.Success),
        );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });

            await channel.setParent(closeCategory);
            await channel.setName(`closed-${username}`);
            await channel.setParent(closeCategory);
            await channel.permissionOverwrites.edit(guild.id, {
                SendMessages: false,
                ViewChannel: false
            });
        } else if (button == 'cancel_close_ticket') {
            const channel = interaction.channel;
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Support System ')
                .setDescription(`Hello <@${user.id}>, Please write the reason for opening this ticket.\nSoon <@&${staffRole}> will reply. Please wait.`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'delete_ticket') {
            const channel = interaction.channel;

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Support System ')
                .setDescription(`This ticket will be deleted in 5 seconds.`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.update({ embeds: [ticketEmbed], components: [] });
            setTimeout(() => {
                channel.delete();
            }, 5000);
        } else if (button == 'reopen_ticket') {
            const channel = interaction.channel;
            const username = channel.topic.split(' ')[0];
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
    .setTitle('🎫 BYPASS Support Center')
    .setDescription(`
👋 Hello <@${user.id}>

Welcome to **BYPASS Support**!

Please tell us the reason for creating this ticket.

📌 You can use this ticket for:
• 🛒 Product Purchase
• 🛠️ Support Request
• ❓ Important Questions

⏳ Our staff team <@&${staffRole}> will reply as soon as possible.

⚠️ Please do not spam or create unnecessary tickets.
`)
    .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.setParent(supportCategory);
            await channel.setName(`ticket-${username}`);
            await channel.permissionOverwrites.edit(userid, {
                SendMessages: true,
                ViewChannel: true
            });
            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'transcript_ticket') {
            const channel = interaction.channel;
            const messages = await channel.messages.fetch();
            const contentHandler = `Transcript for ${channel.name} (${channel.id})\n\n`;
            const content = messages.map(m => `[${m.createdAt.toLocaleDateString()} ${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).join('\n');

            const transcript = new AttachmentBuilder()
                .setName(`transcript-${channel.name}.txt`)
                .setFile(Buffer.from(contentHandler + content));
            
            await interaction.reply({ content: `📩 Your transcript is ready.`, files: [transcript] });
        }
    }
}