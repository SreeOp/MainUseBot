const { ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');

async function createTicketMenu(channel) {
  // Create a dropdown menu with options for ticket categories
  const ticketMenu = new StringSelectMenuBuilder()
    .setCustomId('ticketMenu')
    .setPlaceholder('Select a category to open a ticket')
    .addOptions([
      {
        label: 'Support',
        description: 'Get help with issues',
        value: 'support_ticket',
      },
      {
        label: 'Bug Report',
        description: 'Report a bug',
        value: 'bug_report_ticket',
      },
      {
        label: 'Feedback',
        description: 'Give us feedback',
        value: 'feedback_ticket',
      },
    ]);

  const row = new ActionRowBuilder().addComponents(ticketMenu);

  // Send the dropdown menu to the specified channel
  await channel.send({
    content: 'Please select a category to create a ticket:',
    components: [row],
  });
}

async function handleTicketInteraction(interaction) {
  // Check if the interaction is from the ticket menu
  if (!interaction.isSelectMenu()) return;
  if (interaction.customId !== 'ticketMenu') return;

  const category = interaction.values[0]; // Get the selected category

  // Create a ticket channel with a specific name and permissions
  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.client.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
      },
    ],
  });

  // Send a message to the ticket channel
  await ticketChannel.send({
    content: `Hello ${interaction.user}, a ticket has been created for you in this channel. Our team will assist you shortly!`,
  });

  // Respond to the interaction to acknowledge it
  await interaction.reply({
    content: `Your ticket has been created: ${ticketChannel}`,
    ephemeral: true,
  });
}

module.exports = {
  createTicketMenu,
  handleTicketInteraction,
};
