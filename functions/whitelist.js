const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const moment = require('moment-timezone');

// Register the custom font
GlobalFonts.registerFromPath(path.join(__dirname, '..', '..', 'fonts', 'A25-SQUANOVA.ttf'), 'SkCustom');

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

        await interaction.reply({
          content: 'Your application has been submitted.',
          ephemeral: true,
        });
      }

      if (interaction.isButton() && ['reject-whitelist', 'pending-whitelist'].includes(interaction.customId)) {
        const message = await interaction.message.fetch();

        // Acknowledge the interaction and defer update
        await interaction.deferUpdate();

        if (interaction.customId === 'reject-whitelist') {
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

        if (interaction.customId === 'pending-whitelist') {
          const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
          const gate = `0${Math.floor(1 + Math.random() * 3)}`;
          const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
          const dateTime = moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A');

          const details = {
            username: interaction.user.username,
            flightNumber,
            gate,
            dateTime,
            seat,
          };

          // Send pending message with generated image
          const imageBuffer = await generateTicketImage(details, PENDING_IMAGE_URL);
          const channel = interaction.guild.channels.cache.get(PENDING_CHANNEL);
          await channel.send({
            content: `<@${interaction.user.id}>`,
            files: [{ attachment: imageBuffer, name: 'pending.png' }],
          });

          const member = await interaction.guild.members.fetch(interaction.user.id);
          await member.roles.add(PENDING_ROLE);

          await interaction.reply({
            content: 'The application has been marked as pending.',
            ephemeral: true,
          });

          // Update the embed footer and remove buttons
          const embed = message.embeds[0];
          embed.setFooter({ text: 'NRP Viewed' });
          await message.edit({ embeds: [embed], components: [] });
        }
      }

      if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
        const reason = interaction.fields.getTextInputValue('reject-reason');
        const flightNumber = `${Math.floor(100000 + Math.random() * 900000)}N`;
        const gate = `0${Math.floor(1 + Math.random() * 3)}`;
        const seat = `${Math.floor(50 + Math.random() * 50)}${String.fromCharCode(65 + Math.random() * 6)}`;
        const dateTime = moment().tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm:ss A');

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
          content: `<@${interaction.user.id}>\nReason: ${reason}`,
          files: [{ attachment: imageBuffer, name: 'rejected.png' }],
        });

        await interaction.reply({
          content: 'The application has been rejected.',
          ephemeral: true,
        });

        // Update the embed footer and remove buttons
        const message = await interaction.message.fetch();
        const embed = message.embeds[0];
        embed.setFooter({ text: 'NRP Viewed' });
        await message.edit({ embeds: [embed], components: [] });
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
