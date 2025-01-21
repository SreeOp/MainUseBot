const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
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
      // Handle Apply button press
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

      // Handle modal submission
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
          color: 0xffd700,
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
        const message = await channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [actionRow],
        });

        // Acknowledge the interaction
        await interaction.reply({
          content: 'Your application has been submitted.',
          ephemeral: true,
        });
      }

      // Handle rejection reason modal
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
        const userId = interaction.message.embeds[0]?.footer?.text.split(' ')[2]; // Extract user ID
        const user = await interaction.guild.members.fetch(userId);

        if (user) {
          await user.send(`❌ Your whitelist application has been rejected.\n\n**Reason**: \`${reason}\``);
        }

        await interaction.reply({
          content: `You rejected the whitelist application for <@${userId}>.`,
          ephemeral: true,
        });
      }

      // Handle pending button press
      if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
        const userId = interaction.message.embeds[0]?.footer?.text.split(' ')[2]; // Extract user ID
        const user = await interaction.guild.members.fetch(userId);

        if (user) {
          await user.send(`🔁 Your whitelist application has been put on pending.`);
        }

        await interaction.reply({
          content: `You marked the whitelist application for <@${userId}> as pending.`,
          ephemeral: true,
        });
      }

      // Reject whitelist application
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

        // Update the embed to show that the application is reviewed
        const message = await interaction.message.fetch();
        const embed = message.embeds[0];
        embed.footer.text = 'Reviewed';

        await message.edit({
          embeds: [embed],
          components: [], // Remove the buttons
        });

        // Send a rejection DM to the user
        const userId = interaction.message.embeds[0]?.footer?.text.split(' ')[2]; // Extract user ID
        const user = await interaction.guild.members.fetch(userId);
        if (user) {
          await user.send(`❌ Your whitelist application has been rejected.\n\n**Reason**: \`${reason}\``);
        }

        await interaction.editReply({
          content: 'The application has been rejected and reviewed.',
        });
      }

      // Set application as pending
      if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
        const userId = interaction.message.embeds[0]?.footer?.text.split(' ')[2]; // Extract user ID
        const user = await interaction.guild.members.fetch(userId);

        if (user) {
          await user.send(`🔁 Your whitelist application has been put on pending.`);
        }

        await interaction.reply({
          content: `You marked the whitelist application for <@${userId}> as pending.`,
          ephemeral: true,
        });
      }

      // Function to generate ticket image
      async function generateTicketImage(details, imageURL) {
        const canvas = createCanvas(1024, 331);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(imageURL);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Set custom font and style for the name
        ctx.font = '23px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.username.toUpperCase(), 355, 165);

        // Set custom font and style for date and time
        ctx.font = '23px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.dateTime, 550, 250);

        // Set custom font and style for flight number
        ctx.font = '20px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.flightNumber, 25, 180);

        // Set custom font and style for seat
        ctx.font = '24px SkCustom';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(details.seat, 905, 200);

        // Set custom font and style for gate
        ctx.font = '20px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.gate, 168, 180);

        return canvas.toBuffer('image/png');
      }

    } catch (error) {
      console.error('An error occurred:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred. Please try again later.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'An error occurred. Please try again later.',
          ephemeral: true,
        });
      }
    }
  });

  return initializeWhitelistMessage;
};
