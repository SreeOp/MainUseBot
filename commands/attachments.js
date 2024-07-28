const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attachments')
    .setDescription('Send a message with multiple attachments')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('attachments')
        .setDescription('Comma-separated URLs of attachments to include')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const attachmentUrls = interaction.options.getString('attachments').split(',');

    // Ensure each URL is trimmed to remove any extra spaces
    const attachments = attachmentUrls.map(url => url.trim());

    try {
      await channel.send({
        content: message,
        files: attachments, // Pass the array of attachment URLs
      });
      await interaction.reply({ content: 'Message with attachments sent!', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to send message with attachments.', ephemeral: true });
    }
  },
};
