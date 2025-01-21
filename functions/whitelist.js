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
        await interaction.deferReply({ ephemeral: true });

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
        await channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [actionRow],
        });

        await interaction.editReply({
          content: 'Your application has been submitted.',
        });
      }

      async function generateTicketImage(details, imageURL) {
        const canvas = createCanvas(1024, 331);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(imageURL);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = '23px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.username.toUpperCase(), 355, 165);

        ctx.font = '23px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.dateTime, 550, 250);

        ctx.font = '20px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.flightNumber, 25, 180);

        ctx.font = '24px SkCustom';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(details.seat, 905, 200);

        ctx.font = '20px SkCustom';
        ctx.fillStyle = '#21130d';
        ctx.fillText(details.gate, 168, 180);

        return canvas.toBuffer('image/png');
      }

      if (interaction.isButton() && interaction.customId === 'reject-whitelist') {
        await interaction.deferReply({ ephemeral: true });

        const modal = new ModalBuilder()
          .setCustomId('reject-reason-modal')
          .setTitle('Rejection Reason');

        const reasonInput = new TextInputBuilder()
          .setCustomId('reject-reason')
          .setLabel('Reason for rejection')
          .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);
      }

      if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.fields.getTextInputValue('reject-reason');

        await interaction.user.send({
          content: `❌ Your whitelist application has been rejected.\n\n**Reason**: ${reason}`,
        });

        await interaction.editReply({
          content: 'The rejection reason has been sent to the user.',
        });
      }

      if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
        await interaction.deferReply({ ephemeral: true });

        await interaction.user.send({
          content: '🔁 Your whitelist application has been put on pending.',
        });

        await interaction.editReply({
          content: 'The application has been marked as pending and the user has been notified.',
        });
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
