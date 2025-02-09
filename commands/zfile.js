const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zfile')
    .setDescription('Send an image with a download button in the channel')
    .addStringOption(option =>
      option.setName('imageurl')
        .setDescription('The URL of the image to display')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('downloadlink')
        .setDescription('The URL for downloading the file')
        .setRequired(true)),

  async execute(interaction) {
    const imageUrl = interaction.options.getString('imageurl');
    const downloadLink = interaction.options.getString('downloadlink');

    // Validate URLs (basic check)
    if (!imageUrl.startsWith('http') || !downloadLink.startsWith('http')) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download')
        .setURL(downloadLink)
        .setStyle(ButtonStyle.Link)
    );

    // Send the message in the channel without replying
    await interaction.channel.send({ content: imageUrl, components: [row] });

    // Defer reply to avoid interaction expired error
    await interaction.deferReply({ ephemeral: true });
    await interaction.deleteReply(); // Deletes the command reply
  },
};
