const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket system with a dropdown menu.'),

  async execute(interaction) {
    // Create the dropdown menu for ticket categories
    const dropdown = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket-category')
        .setPlaceholder('Choose a ticket category')
        .addOptions(
          { label: 'General Support', value: 'general_support' },
          { label: 'FRP', value: 'frp' },
          { label: 'Items Loss', value: 'items_loss' },
          { label: 'Premium', value: 'premium' }
        )
    );

    // Embed message for the ticket system
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('🎫 Ticket System')
      .setDescription('Please select a category for your ticket from the dropdown menu.');

    await interaction.reply({ embeds: [embed], components: [dropdown], ephemeral: true });

    // Collector for dropdown interaction
    const filter = i => i.customId === 'ticket-category' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      const category = i.values[0];
      const roles = {
        general_support: '1007930481716760666', // Replace with actual role ID
        frp: '1026192003718975488', // Replace with actual role ID
        items_loss: '1046786167644880946', // Replace with actual role ID
        premium: '1019647599042641970', // Replace with actual role ID
      };

      const roleId = roles[category];
      const categoryNames = {
        general_support: 'General Support',
        frp: 'FRP',
        items_loss: 'Items Loss',
        premium: 'Premium',
      };

      const categoryName = categoryNames[category];

      // Create a private channel or use an existing ticket channel logic here
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${i.user.username}`,
        type: 0, // 0 is GuildText
        topic: `Ticket opened by ${i.user.tag} (${categoryName})`,
        permissionOverwrites: [
          {
            id: interaction.guild.id, // Deny access to everyone
            deny: ['ViewChannel'],
          },
          {
            id: i.user.id, // Allow access to the ticket opener
            allow: ['ViewChannel', 'SendMessages'],
          },
          {
            id: roleId, // Allow access to the appropriate role
            allow: ['ViewChannel', 'SendMessages'],
          },
        ],
      });

      // Embed for the ticket channel
      const ticketEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎫 Ticket Opened')
        .setDescription(
          `Category: **${categoryName}**\n\nUser: <@${i.user.id}>\nSupport Role: <@&${roleId}>`
        )
        .setFooter({ text: 'Click "Close" below to close this ticket.' });

      // Close button
      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close-ticket')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@&${roleId}> <@${i.user.id}>`,
        embeds: [ticketEmbed],
        components: [closeButton],
      });

      await i.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    });

    // Collector for close button
    const closeFilter = i => i.customId === 'close-ticket';
    const closeCollector = interaction.channel.createMessageComponentCollector({ closeFilter, time: 60000 });

    closeCollector.on('collect', async i => {
      if (!i.member.roles.cache.some(role => ['ADMIN_ROLE_ID'].includes(role.id))) {
        return i.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
      }

      // Confirmation message
      const confirmationEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Confirm Ticket Closure')
        .setDescription('Are you sure you want to close this ticket?');

      const confirmButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm-close')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel-close')
          .setLabel('No')
          .setStyle(ButtonStyle.Secondary)
      );

      await i.reply({ embeds: [confirmationEmbed], components: [confirmButtons], ephemeral: true });

      // Collect response
      const confirmFilter = button => ['confirm-close', 'cancel-close'].includes(button.customId) && button.user.id === i.user.id;
      const confirmCollector = i.channel.createMessageComponentCollector({ confirmFilter, time: 30000 });

      confirmCollector.on('collect', async button => {
        if (button.customId === 'confirm-close') {
          // Save transcript
          const messages = await i.channel.messages.fetch({ limit: 100 });
          const transcript = messages
            .map(msg => `${msg.author.tag}: ${msg.content}`)
            .reverse()
            .join('\n');

          const htmlContent = `
            <html>
              <body>
                <pre>${transcript}</pre>
              </body>
            </html>
          `;

          const transcriptPath = path.join(__dirname, 'transcripts', `ticket-${i.channel.id}.html`);
          fs.writeFileSync(transcriptPath, htmlContent);

          const transcriptChannel = i.guild.channels.cache.get('1313134410282962996'); // Replace with actual channel ID
          await transcriptChannel.send({
            files: [transcriptPath],
          });

          await i.channel.delete();
        } else {
          await button.reply({ content: 'Ticket closure canceled.', ephemeral: true });
        }
      });
    });
  },
};
