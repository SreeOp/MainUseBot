const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket for support, reporting, or other inquiries.'),
  async execute(interaction) {
    // The interactionCreate event handles the logic.
    await interaction.reply({
      content: 'Opening ticket menu...',
      ephemeral: true,
    });
  },
};
