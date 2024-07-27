const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config'); // Make sure config is correctly imported

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Send a message with an image and a whitelist button'),
  async execute(interaction) {
    // Create an embed with an image
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Status')
      .setDescription('Click the button below to get whitelisted!')
      .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=66a5aef4&is=66a45d74&hm=8e086dcd0354b98c305995ec2f6b7af41ca854cca741be26ffb1b304fa942d6d&'); // Replace with your image URL

    // Create a button
    const button = new ButtonBuilder()
      .setCustomId('whitelist_button')
      .setLabel('Get Whitelisted')
      .setStyle(ButtonStyle.Primary);

    // Create an action row and add the button to it
    const row = new ActionRowBuilder().addComponents(button);

    // Send the message with the embed and button
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
