// commands/dm.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a direct message to a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to send a DM to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const messageContent = interaction.options.getString('message');

    await targetUser.send(messageContent);
    await interaction.reply('Direct message sent!');
  },
};
