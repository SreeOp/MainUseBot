const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const moment = require('moment-timezone');

module.exports = (client) => {
  // Configuration
  const APPLICATION_CHANNEL = '1255162116126539786';
  const PENDING_CHANNEL = '1313134410282962996';
  const REJECT_CHANNEL = '1313134410282962996';
  const PENDING_ROLE = '1253347271718735882';
  const PENDING_IMAGE_URL = 'https://i.ibb.co/zm3LBZw/pending.png';
  const REJECT_IMAGE_URL = 'https://i.ibb.co/M6WWZ9b/reject.png';

  const initializeWhitelistMessage = async (channel) => {
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Click the **Apply** button to start your whitelist application.')
      .setColor(0xff4500);

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
          { id: 'real-age', label: 'Real Age', min: 2, max: 2 },
          { id: 'character-name', label: 'Character Name' },
          { id: 'roleplay-experience', label: 'Roleplay Experience', max: 9 },
          { id: 'character-backstory', label: 'Character Backstory', min: 100 },
        ];

        questions.forEach((q) => {
          const input = new TextInputBuilder()
            .setCustomId(q.id)
            .setLabel(q.label)
            .setStyle(q.label === 'Character Backstory' ? TextInputStyle.Paragraph : TextInputStyle.Short);

          if (q.min) input.setMinLength(q.min);
          if (q.max) input.setMaxLength(q.max);

          modal.addComponents(new ActionRowBuilder().addComponents(input));
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
          interaction.fields.getTextInputValue('character-backstory'),
        ];

        const embed = new EmbedBuilder()
          .setTitle('Whitelist Application Submitted')
          .setDescription(`<@${interaction.user.id}> has submitted an application.`)
          .addFields(
            { name: 'Real Name', value: `\`\`\`${answers[0]}\`\`\`` },
            { name: 'Real Age', value: `\`\`\`${answers[1]}\`\`\`` },
            { name: 'Character Name', value: `\`\`\`${answers[2]}\`\`\`` },
            { name: 'Roleplay Experience', value: `\`\`\`${answers[3]}\`\`\`` },
            { name: 'Character Backstory', value: `\`\`\`${answers[4]}\`\`\`` }
          )
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setColor(0xffd700);

        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`pending-whitelist-${interaction.user.id}`)
            .setLabel('Pending')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`reject-whitelist-${interaction.user.id}`)
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
        );

        const channel = interaction.guild.channels.cache.get(APPLICATION_CHANNEL);
        await channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [actionRow],
        });

        await interaction.followUp({
          content: 'Your application has been submitted.',
          ephemeral: true,
        });
      }

      async function generateTicketImage(details, imageURL) {
        const canvas = createCanvas(1024, 331);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(imageURL);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFFFFF';

        ctx.fillText(details.username, 280, 180);
        ctx.fillText(details.flightNumber, 80, 280);
        ctx.fillText(details.gate, 240, 280);
        ctx.fillText(details.dateTime, 520, 280);
        ctx.fillText(details.seat, 720, 180);

        return canvas.toBuffer('image/png');
      }

      if (interaction.isButton() && interaction.customId.startsWith('reject-whitelist')) {
        const userId = interaction.customId.split('-')[2];

        const modal = new ModalBuilder()
          .setCustomId(`reject-reason-modal-${userId}`)
          .setTitle('Reject Reason');

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

      if (interaction.isModalSubmit() && interaction.customId.startsWith('reject-reason-modal')) {
        const userId = interaction.customId.split('-')[2];
        const reason = interaction.fields.getTextInputValue('reject-reason');
        const user = await interaction.guild.members.fetch(userId);

        const details = {
          username: user.user.username,
          flightNumber: `${Math.floor(100000 + Math.random() * 900000)}N`,
          gate: `0${Math.floor(1 + Math.random() * 3)}`,
          seat: `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`,
          dateTime: moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A'),
        };

        const imageBuffer = await generateTicketImage(details, REJECT_IMAGE_URL);

        const channel = interaction.guild.channels.cache.get(REJECT_CHANNEL);
        await channel.send({
          content: `<@${userId}>\n**Reason:** ${reason}`,
          files: [{ attachment: imageBuffer, name: 'rejected.png' }],
        });

        await interaction.reply({
          content: 'The application has been rejected and the reason has been sent.',
          ephemeral: true,
        });
      }

      if (interaction.isButton() && interaction.customId.startsWith('pending-whitelist')) {
        await handleApplicationAction(interaction, PENDING_IMAGE_URL, PENDING_CHANNEL, PENDING_ROLE);
      }

      async function handleApplicationAction(interaction, imageURL, channelId, role = null) {
        await interaction.deferUpdate();

        const userId = interaction.customId.split('-')[2];
        const user = await interaction.guild.members.fetch(userId);
        const details = {
          username: user.user.username,
          flightNumber: `${Math.floor(100000 + Math.random() * 900000)}N`,
          gate: `0${Math.floor(1 + Math.random() * 3)}`,
          seat: `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`,
          dateTime: moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A'),
        };

        const imageBuffer = await generateTicketImage(details, imageURL);

        const channel = interaction.guild.channels.cache.get(channelId);
        await channel.send({
          content: `<@${userId}>`,
          files: [{ attachment: imageBuffer, name: 'response.png' }],
        });

        if (role) await user.roles.add(role);

        await interaction.editReply({
          content: 'Action has been taken on this application.',
          components: [],
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
