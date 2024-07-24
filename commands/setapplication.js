const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Sets up the application process.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the application form')
        .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply(); // Acknowledge the interaction

    const channel = interaction.options.getChannel('channel');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff')
          .setLabel('Staff Application')
          .setStyle('Primary'),
        new ButtonBuilder()
          .setCustomId('vehicle')
          .setLabel('Vehicle Application')
          .setStyle('Primary'),
        new ButtonBuilder()
          .setCustomId('developer')
          .setLabel('Developer Application')
          .setStyle('Primary')
      );

    try {
      await channel.send({
        content: 'Click a button to start your application:',
        components: [row]
      });

      // Send the final response after processing
      await interaction.editReply({ content: 'Application setup complete!' });
    } catch (error) {
      console.error('Error sending setup message:', error);

      // Send the final response if there was an error
      await interaction.editReply({ content: 'Failed to set up the application.' });
    }
  },
};
