const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setticket')
    .setDescription('Set up the ticket system in a channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel where the ticket system message will be sent.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: 'Please select a valid text channel.',
        ephemeral: true,
      });
    }

    // Create the dropdown menu for ticket categories
    const dropdown = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket-category')
        .setPlaceholder('Choose a ticket category')
        .addOptions(
          { label: 'General Support', value: 'general_support', description: 'Need general help.' },
          { label: 'FRP', value: 'frp', description: 'Reporting FRP issues.' },
          { label: 'Items Loss', value: 'items_loss', description: 'Lost items report.' },
          { label: 'Premium', value: 'premium', description: 'Help with premium-related issues.' }
        )
    );

    // Embed message for the ticket system
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('🎫 Ticket System')
      .setDescription(
        'Welcome to the ticket system! Please select a category from the dropdown menu below to open a ticket.'
      )
      .setFooter({ text: 'NRP Admin' });

    // Send the embed message with the dropdown menu
    await channel.send({ embeds: [embed], components: [dropdown] });

    await interaction.reply({
      content: `Ticket system message has been sent to ${channel}.`,
      ephemeral: true,
    });
  },
};
