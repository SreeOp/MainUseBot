const { ActionRowBuilder, SelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = (client) => {
  const categoryID = '1253322937604374538'; // Replace with the ID of your ticket category
  const supportRoleID = '1007930481716760666'; // Replace with the support role ID

  // Function to send the ticket menu
  const sendTicketMenu = async (channel) => {
    const menu = new SelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('Select a ticket type...')
      .addOptions([
        {
          label: 'General Support',
          description: 'Get help with general issues.',
          value: 'general_support',
        },
        {
          label: 'Technical Support',
          description: 'For technical issues and bugs.',
          value: 'technical_support',
        },
        {
          label: 'Billing Support',
          description: 'Questions about payments or invoices.',
          value: 'billing_support',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await channel.send({
      content: 'Select the type of ticket you want to create:',
      components: [row],
    });
  };

  // Handle interactions with the ticket menu
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'ticket_menu') {
      const selectedType = interaction.values[0];
      const guild = interaction.guild;
      const member = interaction.member;

      const ticketName = `ticket-${member.user.username}-${selectedType}`;
      const category = guild.channels.cache.get(categoryID);

      // Check if a category exists
      if (!category || category.type !== ChannelType.GuildCategory) {
        return interaction.reply({
          content: 'Ticket category is not set up correctly.',
          ephemeral: true,
        });
      }

      // Create a private channel for the ticket
      const ticketChannel = await guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: categoryID,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
            ],
          },
          {
            id: supportRoleID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      });

      await ticketChannel.send({
        content: `Hello ${member}, a support team member will assist you shortly. Please describe your issue.`,
      });

      interaction.reply({
        content: `Your ticket has been created: ${ticketChannel}`,
        ephemeral: true,
      });
    }
  });

  // Initialize the ticket system in a specific channel
  client.once('ready', () => {
    const ticketChannelID = '1255162116126539786'; // Replace with the channel ID where the ticket menu will be sent
    const channel = client.channels.cache.get(ticketChannelID);

    if (channel) {
      sendTicketMenu(channel);
    } else {
      console.error('Ticket channel not found.');
    }
  });
};
