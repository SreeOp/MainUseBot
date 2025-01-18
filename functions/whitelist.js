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
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the ID of the channel where applications are sent
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the ID of the "pending" log channel
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the ID of the "reject" log channel
  const BACKGROUND_IMAGE_URL = 'https://media.discordapp.net/attachments/1314692162465566750/1330034844620558367/visa-1265296804992258145.png?ex=678c82f9&is=678b3179&hm=e3273fd4c832f5ef36c8e1f0b404c088d4e60fa5dd14b67e6e6dd576c4cd839f&=&format=webp&quality=lossless&width=1024&height=331'; // Replace with the background image URL
  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID for pending users

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

      const embed = {
        title: 'Whitelist Application Submitted',
        description: `<@${interaction.user.id}> has submitted an application.`,
        fields: [
          { name: 'Real Name', value: answers[0] },
          { name: 'Real Age', value: answers[1] },
          { name: 'Character Name', value: answers[2] },
          { name: 'Roleplay Experience', value: answers[3] },
          { name: 'Read Rules', value: answers[4] },
        ],
        footer: { text: `User ID: ${interaction.user.id}` },
        color: 0xFFD700,
      };

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
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [actionRow],
      });

      await interaction.reply({
        content: 'Your application has been submitted.',
        ephemeral: true,
      });
    }

    async function generateTicketImage(details, type) {
      const canvas = createCanvas(1024, 331);
      const ctx = canvas.getContext('2d');
      const background = await loadImage(BACKGROUND_IMAGE_URL);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`Status: ${type}`, 50, 50);
      ctx.fillText(`User: ${details.username}`, 50, 100);
      ctx.fillText(`Flight No.: ${details.flightNumber}`, 50, 150);
      ctx.fillText(`Gate: ${details.gate}`, 50, 200);
      ctx.fillText(`Date/Time: ${details.dateTime}`, 50, 250);
      ctx.fillText(`Seat: ${details.seat}`, 50, 300);

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

      const imageBuffer = await generateTicketImage(details, 'Rejected');

      const channel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
      await channel.send({
        content: `Reason for rejection: ${reason}`,
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

      const imageBuffer = await generateTicketImage(details, 'Pending');

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
