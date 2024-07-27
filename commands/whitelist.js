const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Send a whitelist message with a button'),
  async execute(interaction) {
    // URL or path of the image you want to send
    const imageUrl = 'https://path.to/your/image.png'; // Change to your image URL or path
    const imageAttachment = new AttachmentBuilder(imageUrl);

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId('get_whitelist')
      .setLabel('Get Whitelist')
      .setStyle(ButtonStyle.Primary);

    // Create the action row and add the button to it
    const row = new ActionRowBuilder().addComponents(button);

    // Send the message with the image and button
    await interaction.reply({
      content: 'Click the button to get whitelisted!',
      files: [imageAttachment],
      components: [row],
    });
  },
};
