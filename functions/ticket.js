const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const SUPPORT_ROLES = {
  general_support: '1007930481716760666', // Replace with actual role ID for General Support
  frp: '1026192003718975488', // Replace with actual role ID for FRP
  items_loss: '1046786167644880946', // Replace with actual role ID for Items Loss
  premium: '1019647599042641970', // Replace with actual role ID for Premium
};

module.exports = async (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket-category') return;

    const selectedCategory = interaction.values[0];
    const roleId = SUPPORT_ROLES[selectedCategory];

    if (!roleId) {
      return interaction.reply({
        content: 'Invalid category selected.',
        ephemeral: true,
      });
    }

    // Create a new channel for the ticket
    const ticketChannelName = `ticket-${interaction.user.username}-${selectedCategory}`;
    const guild = interaction.guild;

    try {
      const ticketChannel = await guild.channels.create({
        name: ticketChannelName,
        type: 0, // Guild text channel
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id, // Ticket opener
            allow: ['ViewChannel', 'SendMessages', 'AttachFiles'],
          },
          {
            id: roleId, // Appropriate support role
            allow: ['ViewChannel', 'SendMessages'],
          },
        ],
      });

      // Send the ticket creation confirmation message
      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('Ticket Created')
        .setDescription(
          `Hello <@${interaction.user.id}>, your ticket has been created. A member of the <@&${roleId}> team will assist you shortly.`
        )
        .setFooter({ text: 'NRP Admin' });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close-ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ embeds: [embed], components: [closeButton] });

      await interaction.reply({
        content: `Your ticket has been created: ${ticketChannel}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      await interaction.reply({
        content: 'There was an error creating your ticket. Please try again later.',
        ephemeral: true,
      });
    }
  });

  // Handle the close ticket button
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'close-ticket') return;

    const ticketChannel = interaction.channel;

    // Ask for confirmation to close
    const confirmationEmbed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('Confirm Ticket Closure')
      .setDescription('Are you sure you want to close this ticket?');

    const confirmationButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm-close')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel-close')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [confirmationEmbed],
      components: [confirmationButtons],
      ephemeral: true,
    });
  });

  // Handle confirmation buttons
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'confirm-close') {
      const ticketChannel = interaction.channel;

      // Save the transcript to a channel
      const transcriptChannelId = '1313134410282962996'; // Replace with the ID of the transcript channel
      const transcriptChannel = interaction.guild.channels.cache.get(transcriptChannelId);

      if (transcriptChannel) {
        const messages = await ticketChannel.messages.fetch({ limit: 100 });
        const transcript = messages
          .reverse()
          .map(
            (msg) =>
              `${msg.author.tag} (${msg.createdAt.toLocaleString()}): ${msg.content}`
          )
          .join('\n');

        const transcriptEmbed = new EmbedBuilder()
          .setColor('#FF4500')
          .setTitle(`Transcript for ${ticketChannel.name}`)
          .setDescription('Saved messages from this ticket.')
          .setFooter({ text: 'NRP Admin' });

        await transcriptChannel.send({
          embeds: [transcriptEmbed],
          files: [{ attachment: Buffer.from(transcript, 'utf-8'), name: `${ticketChannel.name}-transcript.txt` }],
        });
      }

      await ticketChannel.delete();
    } else if (interaction.customId === 'cancel-close') {
      await interaction.reply({
        content: 'Ticket closure canceled.',
        ephemeral: true,
      });
    }
  });
};
