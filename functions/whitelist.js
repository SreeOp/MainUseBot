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
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the channel where applications are sent
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the "pending" channel ID
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the "reject" channel ID
  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID for pending users
  const PENDING_IMAGE_URL = 'https://i.ibb.co/zm3LBZw/pending.png'; // Replace with the background image URL for pending
  const REJECT_IMAGE_URL = 'https://i.ibb.co/M6WWZ9b/reject.png'; // Replace with the background image URL for reject

  const generateTicketImage = async (details, type) => {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    const backgroundImageURL =
      type === 'Pending' ? PENDING_IMAGE_URL : REJECT_IMAGE_URL;
    const background = await loadImage(backgroundImageURL);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#FFFFFF';

    ctx.fillText(details.name, 50, 100);
    ctx.fillText(details.flightNumber, 50, 150);
    ctx.fillText(details.gate, 50, 200);
    ctx.fillText(details.dateTime, 50, 250);
    ctx.fillText(details.seat, 50, 300);

    return canvas.toBuffer('image/png');
  };

  client.on('interactionCreate', async (interaction) => {
    // Handle modal submissions for rejection reason
    if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
      const reason = interaction.fields.getTextInputValue('reject-reason');
      const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
      const gate = `0${Math.floor(1 + Math.random() * 3)}`;
      const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
      const dateTime = new Date().toLocaleString();

      const details = {
        name: interaction.user.username,
        flightNumber,
        gate,
        dateTime,
        seat,
      };

      const imageBuffer = await generateTicketImage(details, 'Reject');

      const channel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
      await channel.send({
        content: `@${interaction.user.username}\nReason: ${reason}`,
        files: [{ attachment: imageBuffer, name: 'rejection.png' }],
      });

      await interaction.reply({
        content: 'The application has been rejected, and the reason has been logged.',
        ephemeral: true,
      });
    }

    // Handle pending actions
    if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
      const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
      const gate = `0${Math.floor(1 + Math.random() * 3)}`;
      const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
      const dateTime = new Date().toLocaleString();

      const details = {
        name: interaction.user.username,
        flightNumber,
        gate,
        dateTime,
        seat,
      };

      const imageBuffer = await generateTicketImage(details, 'Pending');

      const channel = interaction.guild.channels.cache.get(PENDING_CHANNEL);
      await channel.send({
        content: `@${interaction.user.username}`,
        files: [{ attachment: imageBuffer, name: 'pending.png' }],
      });

      // Assign the pending role to the user
      const member = await interaction.guild.members.fetch(interaction.user.id);
      await member.roles.add(PENDING_ROLE);

      await interaction.reply({
        content: 'The application has been marked as pending.',
        ephemeral: true,
      });
    }
  });

  return async (channel) => {
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
};
