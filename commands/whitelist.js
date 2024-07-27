const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Send a whitelist message with a button'),
  async execute(interaction) {
    // URL or path of the image you want to send
    const imageUrl = 'https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=66a5aef4&is=66a45d74&hm=8e086dcd0354b98c305995ec2f6b7af41ca854cca741be26ffb1b304fa942d6d&'; // Change to your image URL or path
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
