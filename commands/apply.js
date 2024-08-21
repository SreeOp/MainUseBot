const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply for staff position'),
        
    async execute(interaction) {
        // Step 1: Send an image with "Apply" button
        const applyEmbed = new EmbedBuilder()
            .setTitle('Staff Application')
            .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=66c6a474&is=66c552f4&hm=469130726847260794179cc767a2a9ba509d6e8ec534532189435011894f653e&') // Replace with the actual image URL
            .setColor('#0099ff');

        const applyButton = new ButtonBuilder()
            .setCustomId('apply_button')
            .setLabel('Apply')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(applyButton);

        await interaction.reply({ embeds: [applyEmbed], components: [row], ephemeral: false });
    },
};
