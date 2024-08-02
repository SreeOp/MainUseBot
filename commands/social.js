const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('socialmedia')
        .setDescription('Sends a custom embed with a link button.')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('image')
                .setDescription('The URL of the image for the embed')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('buttonname')
                .setDescription('The text on the button')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('buttonurl')
                .setDescription('The URL the button links to')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emojiurl')
                .setDescription('The URL of the emoji for the button')
                .setRequired(false)), // Optional

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const imageUrl = interaction.options.getString('image');
        const buttonName = interaction.options.getString('buttonname');
        const buttonUrl = interaction.options.getString('buttonurl');
        const emojiUrl = interaction.options.getString('emojiurl');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setImage(imageUrl)
            .setColor(0xFF4D00); // Custom color code

        const button = new ButtonBuilder()
            .setLabel(buttonName)
            .setStyle(ButtonStyle.Link)
            .setURL(buttonUrl);

        if (emojiUrl) {
            button.setEmoji({ url: emojiUrl });
        }

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
