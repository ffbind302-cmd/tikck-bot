const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup support system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('Channel where support system will be created').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Staff role for tickets').setRequired(true))
        .addChannelOption(option => option.setName('open').setDescription('Category for open tickets').setRequired(true))
        .addChannelOption(option => option.setName('close').setDescription('Category for closed tickets').setRequired(true)),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const open = interaction.options.getChannel('open');
        const close = interaction.options.getChannel('close');

        if (channel.type !== ChannelType.GuildText) {
            return await interaction.reply({ content: `⚠️ \`channel\` seçeneği bir metin kanalı olmalıdır!`, ephemeral: true });
        }

        if (open.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ `open` seçeneği bir kategori kanalı olmalıdır!', ephemeral: true });
        }

        if (close.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ `Kapat` seçeneği bir kategori kanalı olmalıdır!', ephemeral: true });
        }

        const data = {
            channel: channel.id,
            role: role.id,
            open: open.id,
            close: close.id
        };

        fs.writeFileSync(`./database/${interaction.guildId}.json`, JSON.stringify(data, null, 4));

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support System')
            .setDescription('Click the button below to create a support ticket')
            .setColor('#6104b9')
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('📩 Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Support system configured', ephemeral: true });
    }
}