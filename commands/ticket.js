const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a new support ticket'),
  async execute(interaction) {
    const ticketMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketMenu')
      .setPlaceholder('Select a category for your ticket')
      .addOptions(
        {
          label: 'Support',
          description: 'Get help with our products or services',
          value: 'support',
        },
        {
          label: 'Feedback',
          description: 'Give us your feedback',
          value: 'feedback',
        },
        {
          label: 'Other',
          description: 'Other inquiries',
          value: 'other',
        },
      );

    const row = new ActionRowBuilder().addComponents(ticketMenu);

    await interaction.reply({ content: 'Please select a category for your ticket:', components: [row], ephemeral: true });
  },
};
