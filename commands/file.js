const { SlashCommandBuilder, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('file')
    .setDescription('Send a message with an image and a download button')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL of the image to include')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('downloadurl')
        .setDescription('Custom download URL')
        .setRequired(true)),
  async execute(interaction) {
    const messageContent = interaction.options.getString('message');
    const imageUrl = interaction.options.getString('image');
    const downloadUrl = interaction.options.getString('downloadurl');

    const embed = new MessageEmbed()
      .setDescription(messageContent)
      .setImage(imageUrl);

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Download')
          .setStyle('LINK')
          .setURL(downloadUrl)
      );

    try {
      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
  },
};
