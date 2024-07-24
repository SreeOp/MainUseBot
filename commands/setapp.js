const { SlashCommandBuilder } = require('discord.js');
const config = require('../config'); // Import config to update the application channel ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapp')
    .setDescription('Set the channel for staff applications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where staff applications will be sent')
        .setRequired(true)),
  async execute(interaction) {
    // Check if the user has permission to set the application channel
    const memberRoles = interaction.member.roles.cache;
    const hasPermission = config.allowedRoles.some(roleId => memberRoles.has(roleId));

    if (!hasPermission) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // Get the channel from the command options
    const channel = interaction.options.getChannel('channel');

    // Update the application channel ID in config (or environment variable)
    config.applicationChannelId = channel.id;

    // Optionally, you can save the updated config to a file or database here
    // For example: fs.writeFileSync('config.json', JSON.stringify(config));

    await interaction.reply({ content: `The application channel has been set to ${channel}.`, ephemeral: true });
  },
};
