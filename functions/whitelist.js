const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the channel ID for submitted applications
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the pending log channel ID
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the reject log channel ID
  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID assigned for pending users
  const WHITELIST_MANAGER_ROLE = '1046786167644880946'; // Replace with the role ID of the whitelist manager
  const BACKGROUND_IMAGE_PENDING = 'https://i.ibb.co/zm3LBZw/pending.png'; // Background image URL for pending
  const BACKGROUND_IMAGE_REJECT = 'https://i.ibb.co/M6WWZ9b/reject.png'; // Background image URL for reject

  const initializeWhitelistMessage = async (channel) => {
    const embed = {
      title: 'Whitelist Application',
      description: 'Click the **Apply** button to start your whitelist application.',
      color: 0xFF4500,
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply-whitelist')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
  };

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
      const modal = new ModalBuilder()
        .setCustomId('whitelist-application')
        .setTitle('Whitelist Application');

      const questions = [
        { id: 'real-name', label: 'Real Name' },
        { id: 'real-age', label: 'Real Age' },
        { id: 'character-name', label: 'Character Name' },
        { id: 'roleplay-experience', label: 'Roleplay Experience' },
        { id: 'read-rules', label: 'Did you read the rules (yes/no)?' },
      ];

      questions.forEach((q) => {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(q.id)
              .setLabel(q.label)
              .setStyle(TextInputStyle.Short)
          )
        );
      });

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
      const answers = [
        interaction.fields.getTextInputValue('real-name'),
        interaction.fields.getTextInputValue('real-age'),
        interaction.fields.getTextInputValue('character-name'),
        interaction.fields.getTextInputValue('roleplay-experience'),
        interaction.fields.getTextInputValue('read-rules'),
      ];

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('pending-whitelist')
          .setLabel('Pending')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('reject-whitelist')
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger)
      );

      const channel = interaction.guild.channels.cache.get(APPLICATION_CHANNEL);
      await channel.send({
        content: `<@&${WHITELIST_MANAGER_ROLE}>`,
        components: [actionRow],
      });

      await interaction.reply({
        content: 'Your application has been submitted.',
        ephemeral: true,
      });
    }

    async function generateTicketImage(details, backgroundImageURL) {
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');
      const background = await loadImage(backgroundImageURL);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(details.username, 50, 100);
      ctx.fillText(details.flightNumber, 50, 150);
      ctx.fillText(details.gate, 50, 200);
      ctx.fillText(details.dateTime, 50, 250);
      ctx.fillText(details.seat, 50, 300);

      return canvas.toBuffer('image/png');
    }

    if (interaction.isButton() && interaction.customId === 'reject-whitelist') {
      const modal = new ModalBuilder()
        .setCustomId('reject-reason-modal')
        .setTitle('Rejection Reason');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('reject-reason')
            .setLabel('Reason for rejection')
            .setStyle(TextInputStyle.Paragraph)
        )
      );

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
      const reason = interaction.fields.getTextInputValue('reject-reason');
      const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
      const gate = `0${Math.floor(1 + Math.random() * 3)}`;
      const seat = `${Math.floor(50 + Math.random() * 50)} ${String.fromCharCode(65 + Math.random() * 6)}`;
      const dateTime = new Date().toLocaleString();

      const details = {
        username: interaction.user.username,
        flightNumber,
        gate,
        dateTime,
        seat,
      };

      const imageBuffer = await generateTicketImage(details, BACKGROUND_IMAGE_REJECT);

      const channel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
      await channel.send({
        content: `@${interaction.user.tag}\nReason: ${reason}`,
        files: [{ attachment: imageBuffer, name: 'rejection.png' }],
      });

      await interaction.reply({
        content: 'The application has been rejected and the reason has been logged.',
        ephemeral: true,
      });
    }

    if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
      const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
      const gate = `0${Math.floor(1 + Math.random() * 3)}`;
      const seat = `${Math.floor(50 + Math.random() * 50)} ${String.fromCharCode(65 + Math.random() * 6)}`;
      const dateTime = new Date().toLocaleString();

      const details = {
        username: interaction.user.username,
        flightNumber,
        gate,
        dateTime,
        seat,
      };

      const imageBuffer = await generateTicketImage(details, BACKGROUND_IMAGE_PENDING);

      const member = await interaction.guild.members.fetch(interaction.user.id);
      await member.roles.add(PENDING_ROLE);

      const channel = interaction.guild.channels.cache.get(PENDING_CHANNEL);
      await channel.send({
        files: [{ attachment: imageBuffer, name: 'pending.png' }],
      });

      await interaction.reply({
        content: 'The application has been marked as pending.',
        ephemeral: true,
      });
    }
  });

  return initializeWhitelistMessage;
};
