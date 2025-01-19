const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder, // Remove if not needed
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const moment = require('moment-timezone');

// Register the custom font
GlobalFonts.registerFromPath(
  path.join(__dirname, '..', '..', 'fonts', 'A25-SQUANOVA.ttf'),
  'SkCustom'
);

module.exports = (client) => {
  // Configuration
  const APPLICATION_CHANNEL = '1255162116126539786';
  const PENDING_CHANNEL = '1313134410282962996';
  const REJECT_CHANNEL = '1313134410282962996';
  const PENDING_ROLE = '1253347271718735882';
  const PENDING_IMAGE_URL = 'https://i.ibb.co/zm3LBZw/pending.png';
  const REJECT_IMAGE_URL = 'https://i.ibb.co/M6WWZ9b/reject.png';

  const initializeWhitelistMessage = async (channel) => {
    const embed = {
      title: 'Whitelist Application',
      description: 'Click the **Apply** button to start your whitelist application.',
      color: 0xff4500,
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
    try {
      if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
        // Modal logic removed because you requested not to use it anymore
        await interaction.reply({
          content: 'Your application has been submitted.',
          ephemeral: true,
        });
      }

      async function generateTicketImage(details, imageURL) {
        const canvas = createCanvas(1024, 331);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(imageURL);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Set custom font and style for the name
        ctx.font = '35px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.username.toUpperCase(), 550, 250);

        // Set custom font and style for date and time
        ctx.font = '33px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.dateTime, 30, 365);

        // Set custom font and style for flight number
        ctx.font = '30px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.flightNumber, 30, 300);

        // Set custom font and style for seat
        ctx.font = '30px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.seat, 30, 335);

        return canvas.toBuffer('image/png');
      }

      if (interaction.isButton() && interaction.customId === 'reject-whitelist') {
        const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
        const gate = `0${Math.floor(1 + Math.random() * 3)}`;
        const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
        const dateTime = moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A'); // 12-hour format

        const details = {
          username: interaction.user.username,
          flightNumber,
          gate,
          dateTime,
          seat,
        };

        const imageBuffer = await generateTicketImage(details, REJECT_IMAGE_URL);

        const channel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
        await channel.send({
          content: `<@${interaction.user.id}>`,
          files: [{ attachment: imageBuffer, name: 'rejected.png' }],
        });

        // Modify the embed to show "Reviewed" and disable buttons
        const message = await interaction.message.fetch();
        const embed = message.embeds[0];
        embed.footer = { text: 'Reviewed' };
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('pending-whitelist')
            .setLabel('Pending')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('reject-whitelist')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        await message.edit({
          embeds: [embed],
          components: [row],
        });

        await interaction.reply({
          content: 'The application has been rejected.',
          ephemeral: true,
        });
      }

      if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
        const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
        const gate = `0${Math.floor(1 + Math.random() * 3)}`;
        const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
        const dateTime = moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A'); // 12-hour format

        const details = {
          username: interaction.user.username,
          flightNumber,
          gate,
          dateTime,
          seat,
        };

        const imageBuffer = await generateTicketImage(details, PENDING_IMAGE_URL);

        const channel = interaction.guild.channels.cache.get(PENDING_CHANNEL);
        await channel.send({
          content: `<@${interaction.user.id}>`,
          files: [{ attachment: imageBuffer, name: 'pending.png' }],
        });

        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(PENDING_ROLE);

        // Modify the embed to show "Reviewed" and disable buttons
        const message = await interaction.message.fetch();
        const embed = message.embeds[0];
        embed.footer = { text: 'Reviewed' };
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('pending-whitelist')
            .setLabel('Pending')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('reject-whitelist')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        await message.edit({
          embeds: [embed],
          components: [row],
        });

        await interaction.reply({
          content: 'The application has been marked as pending.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred. Please try again later.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
      }
    }
  });

  return initializeWhitelistMessage;
};
