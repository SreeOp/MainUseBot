const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { writeFileSync } = require('fs');
const path = require('path');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the ID of the channel where applications are sent
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the ID of the "pending" log channel
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the ID of the "reject" log channel
  const BACKGROUND_IMAGE_URL = 'https://media.discordapp.net/attachments/1188478795850723479/1313479605054865525/nrp_approved.png?ex=678c44f5&is=678af375&hm=45faed2df509c304b23d6bbc3fd0956381c3009030713648071ffd022768c89f&=&format=webp&quality=lossless&width=1024&height=413'; // Replace with the background image URL

  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID for pending users

  // Helper function to generate a random flight number
  const generateFlightNumber = () => `${Math.floor(10000 + Math.random() * 90000)}N`;

  // Helper function to generate a random gate
  const generateGate = () => `0${Math.floor(1 + Math.random() * 3)}`;

  // Helper function to generate a random seat
  const generateSeat = () => `${Math.floor(1 + Math.random() * 100)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  // Function to create an image with user details
  const createCustomImage = async (userName, status, additionalText = '') => {
    const canvas = createCanvas(1024, 331);
    const ctx = canvas.getContext('2d');

    // Load background image
    const background = await loadImage(BACKGROUND_IMAGE_URL);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // Add text to the canvas
    ctx.fillText(`Status: ${status}`, canvas.width / 2, 50);
    ctx.fillText(`Name: ${userName}`, canvas.width / 2, 100);
    ctx.fillText(`Flight: ${generateFlightNumber()}`, canvas.width / 2, 150);
    ctx.fillText(`Gate: ${generateGate()}`, canvas.width / 2, 200);
    ctx.fillText(`Seat: ${generateSeat()}`, canvas.width / 2, 250);
    ctx.fillText(`Date & Time: ${new Date().toLocaleString()}`, canvas.width / 2, 300);

    if (additionalText) {
      ctx.fillText(`Reason: ${additionalText}`, canvas.width / 2, 350);
    }

    // Save the image and return the file path
    const filePath = path.join(__dirname, `whitelist_${Date.now()}.png`);
    writeFileSync(filePath, canvas.toBuffer('image/png'));
    return filePath;
  };

  const initializeWhitelistMessage = async (channel) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply-whitelist')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: 'Click the **Apply** button to start your whitelist application.',
      components: [row],
    });
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
        content: `Application from <@${interaction.user.id}>`,
        components: [actionRow],
      });

      await interaction.reply({
        content: 'Your application has been submitted.',
        ephemeral: true,
      });
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
      const filePath = await createCustomImage(interaction.user.username, 'Rejected', reason);

      const logChannel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
      await logChannel.send({
        content: `Rejection reason for <@${interaction.user.id}>`,
        files: [filePath],
      });

      await interaction.reply({
        content: 'The application has been rejected.',
        ephemeral: true,
      });
    }

    if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
      const filePath = await createCustomImage(interaction.user.username, 'Pending');

      const logChannel = interaction.guild.channels.cache.get(PENDING_CHANNEL);
      await logChannel.send({
        content: `Pending status for <@${interaction.user.id}>`,
        files: [filePath],
      });

      await interaction.reply({
        content: 'The application has been marked as pending.',
        ephemeral: true,
      });
    }
  });

  return initializeWhitelistMessage;
};
