const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = (client) => {
  const CATEGORY_ID = '1253322937604374538'; // Replace with the ID of the category where tickets will be created
  const ADMIN_ROLE_ID = '1007930481716760666'; // Replace with the role ID for admins

  const createTicketEmbed = async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket System')
      .setDescription('Welcome to the Ticket System! Please select a category to open a ticket.')
      .addFields(
        { name: '🎉 Giveaway', value: 'Create this ticket if you have won a giveaway.' },
        { name: '💰 Dream Bazaar', value: 'Create this ticket if you want to purchase something.' },
        { name: '❓ General Support', value: 'Create this ticket for any other questions or support.' }
      )
      .setColor('Blurple');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('ticket_giveaway').setLabel('🎉 Giveaway').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_bazaar').setLabel('💰 Dream Bazaar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ticket_support').setLabel('❓ General Support').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  };

  const handleTicketCreation = async (interaction, ticketType) => {
    const guild = interaction.guild;

    // Create a new ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: ADMIN_ROLE_ID,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`${ticketType} Ticket`)
      .setDescription('The staff will assist you soon!')
      .setFooter({ text: 'Click a button below to manage this ticket.' })
      .setColor('Green');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('📌 Claim Ticket')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_delete')
          .setLabel('❌ Delete Ticket')
          .setStyle(ButtonStyle.Danger)
      );

    await ticketChannel.send({
      content: `<@&${ADMIN_ROLE_ID}> <@${interaction.user.id}>`,
      embeds: [ticketEmbed],
      components: [row],
    });

    await interaction.reply({
      content: `Your ticket has been created: <#${ticketChannel.id}>`,
      ephemeral: true,
    });
  };

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isCommand()) return;

    // Handle ticket categories
    if (interaction.customId === 'ticket_giveaway') {
      await handleTicketCreation(interaction, '🎉 Giveaway');
    } else if (interaction.customId === 'ticket_bazaar') {
      await handleTicketCreation(interaction, '💰 Dream Bazaar');
    } else if (interaction.customId === 'ticket_support') {
      await handleTicketCreation(interaction, '❓ General Support');
    }

    // Handle ticket management buttons
    if (interaction.customId === 'ticket_claim') {
      if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({ content: 'Only admins can claim tickets.', ephemeral: true });
      }
      return interaction.reply({ content: `${interaction.user.tag} has claimed the ticket.`, ephemeral: false });
    }

    if (interaction.customId === 'ticket_close') {
      if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({ content: 'Only admins can close tickets.', ephemeral: true });
      }
      await interaction.channel.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, {
        SendMessages: false,
      });
      return interaction.reply('The ticket has been closed.');
    }

    if (interaction.customId === 'ticket_delete') {
      if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({ content: 'Only admins can delete tickets.', ephemeral: true });
      }
      await interaction.channel.delete();
    }
  });

  client.on('ready', async () => {
    const channel = await client.channels.fetch('1254436933875011615'); // Replace with your main channel ID
    await createTicketEmbed(channel);
  });
};
