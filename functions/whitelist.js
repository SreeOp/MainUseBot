const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const path = require('path');
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
      // Handle apply-whitelist button click
      if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferReply({ ephemeral: true });

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

          // Ensure modal is shown only if interaction isn't already deferred/replied
          if (!interaction.replied && !interaction.deferred) {
            console.log('Showing modal...');
            await interaction.showModal(modal);
          }
        }
      }

      // Handle modal submission
      if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
        // Prevent further acknowledgement if already deferred or replied
        if (interaction.replied || interaction.deferred) return;

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
        const message = await channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [actionRow],
        });

        // Store message ID for later update (in case buttons are pressed)
        message.customId = message.id;

        await interaction.editReply({
          content: 'Your application has been submitted.',
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
