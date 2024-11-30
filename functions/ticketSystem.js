const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = (client) => {
  const ticketCategory = '1253322937604374538'; // Replace with your ticket category ID or leave null to use no category.
  const allowedRoles = ['1007930481716760666', '1046786167644880946']; // Replace with role IDs allowed to manage tickets.

  // Function to send the initial ticket menu
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ticket') {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_type_menu')
        .setPlaceholder('Select your ticket type')
        .addOptions([
          { label: 'Support', value: 'support', description: 'Get help from our support team' },
          { label: 'Report', value: 'report', description: 'Report an issue or bug' },
          { label: 'Other', value: 'other', description: 'Other inquiries or requests' },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Please select the type of ticket you would like to create:',
        components: [row],
        ephemeral: true,
      });
    }
  });

  // Handling ticket creation based on menu selection
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'ticket_type_menu') {
      const ticketType = interaction.values[0];
      const ticketName = `ticket-${interaction.user.username}-${ticketType}`;

      // Check if a ticket channel already exists for this user
      const existingChannel = interaction.guild.channels.cache.find(
        (channel) => channel.name === ticketName && channel.type === ChannelType.GuildText
      );

      if (existingChannel) {
        return interaction.reply({
          content: `You already have an open ticket: <#${existingChannel.id}>`,
          ephemeral: true,
        });
      }

      // Create the ticket channel
      const ticketChannel = await interaction.guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: ticketCategory || null,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Hide channel from everyone
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          ...allowedRoles.map((roleId) => ({
            id: roleId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          })),
        ],
      });

      // Add "Close" and "Delete" buttons
      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setStyle(ButtonStyle.Primary);

      const deleteButton = new ButtonBuilder()
        .setCustomId('delete_ticket')
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger);

      const buttonRow = new ActionRowBuilder().addComponents(closeButton, deleteButton);

      await ticketChannel.send({
        content: `<@${interaction.user.id}> Your ticket has been created. Our team will assist you shortly.`,
        components: [buttonRow],
      });

      await interaction.reply({
        content: `Your ticket has been created: <#${ticketChannel.id}>`,
        ephemeral: true,
      });
    }
  });

  // Handling "Close" and "Delete" buttons
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const ticketChannel = interaction.channel;

    if (interaction.customId === 'close_ticket') {
      // Lock the ticket channel
      await ticketChannel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false,
      });

      await interaction.reply({ content: 'This ticket has been closed. Use the "Delete" button to delete it.', ephemeral: true });
    }

    if (interaction.customId === 'delete_ticket') {
      // Delete the ticket channel
      await interaction.reply({ content: 'Deleting this ticket...', ephemeral: true });
      await ticketChannel.delete().catch((err) => console.error('Failed to delete the ticket channel:', err));
    }
  });
};
