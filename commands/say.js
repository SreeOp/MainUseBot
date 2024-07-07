const { SlashCommandBuilder } = require('discord.js');

// Define the role IDs allowed to use the command
const AllowedRoleIDs = ['1007930481716760666', '1046786167644880946']; // Replace with actual role IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('attachment')
        .setDescription('URL of an attachment to include (optional)')
        .setRequired(false)), // Make attachment optional
  async execute(interaction) {
    // Check if user has any of the allowed roles by ID
    const memberRoles = interaction.member.roles.cache;
    const hasAllowedRole = memberRoles.some(role => AllowedRoleIDs.includes(role.id));

    if (!hasAllowedRole) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const attachmentUrl = interaction.options.getString('attachment');

    try {
      if (attachmentUrl) {
        await channel.send({
          content: message,
          files: [attachmentUrl], // Pass the attachment URL as an array
        });
      } else {
        await channel.send(message);
      }
      await interaction.reply({ content: 'Message sent!', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to send message.', ephemeral: true });
    }
  },
};
