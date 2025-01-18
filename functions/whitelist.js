const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const moment = require('moment-timezone');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the application channel ID
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the pending channel ID
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the reject channel ID
  const PENDING_ROLE = '1253347271718735882'; // Replace with the pending role ID
  const PENDING_IMAGE_URL = 'https://i.ibb.co/zm3LBZw/pending.png'; // Pending background image
  const REJECT_IMAGE_URL = 'https://i.ibb.co/M6WWZ9b/reject.png'; // Reject background image

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
      // Apply Button
      if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
        const modal = new ModalBuilder()
          .setCustomId('whitelist-application')
          .setTitle('Whitelist Application');

        // Questions
        const questions = [
          {
            id: 'real-name',
            label: 'Real Name',
            minLength: 1,
            maxLength: 50,
          },
          {
            id: 'real-age',
            label: 'Real Age',
            minLength: 2,
            maxLength: 2,
          },
          {
            id: 'character-name',
            label: 'Character Name',
            minLength: 1,
            maxLength: 50,
          },
          {
            id: 'roleplay-experience',
            label: 'Roleplay Experience (Max 9 Characters)',
            minLength: 1,
            maxLength: 9,
          },
          {
            id: 'character-backstory',
            label: 'Character Backstory (Min 100 Characters)',
            minLength: 100,
            maxLength: 1000,
          },
        ];

        questions.forEach((q) => {
          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(q.id)
                .setLabel(q.label)
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(q.minLength)
                .setMaxLength(q.maxLength)
                .setRequired(true)
            )
          );
        });

        await interaction.showModal(modal);
      }

      // Submit Modal
      if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
        const answers = {
          realName: interaction.fields.getTextInputValue('real-name'),
          realAge: interaction.fields.getTextInputValue('real-age'),
          characterName: interaction.fields.getTextInputValue('character-name'),
          roleplayExperience: interaction.fields.getTextInputValue('roleplay-experience'),
          characterBackstory: interaction.fields.getTextInputValue('character-backstory'),
        };

        const embed = {
          title: 'Whitelist Application Submitted',
          description: `<@${interaction.user.id}> has submitted an application.\n\n` +
            `**Questions and Answers:**\n` +
            `1. **Real Name:** \`\`\`${answers.realName}\`\`\`\n` +
            `2. **Real Age:** \`\`\`${answers.realAge}\`\`\`\n` +
            `3. **Character Name:** \`\`\`${answers.characterName}\`\`\`\n` +
            `4. **Roleplay Experience:** \`\`\`${answers.roleplayExperience}\`\`\`\n` +
            `5. **Character Backstory:** \`\`\`${answers.characterBackstory}\`\`\``,
          color: 0xffd700,
          footer: { text: 'Pending Review' },
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

      // Generate Image
      async function generateTicketImage(details, imageURL) {
        const canvas = createCanvas(1024, 331);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(imageURL);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFFFFF';

        ctx.fillText(details.username, 100, 100);
        ctx.fillText(details.flightNumber, 100, 150);
        ctx.fillText(details.gate, 100, 200);
        ctx.fillText(details.dateTime, 100, 250);
        ctx.fillText(details.seat, 100, 300);

        return canvas.toBuffer('image/png');
      }

      // Reject Button
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

      // Reject Reason Submit
      if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
        const reason = interaction.fields.getTextInputValue('reject-reason');

        const embed = {
          title: `Rejected by ${interaction.user.username}`,
          description: `Reason: \`\`\`${reason}\`\`\``,
          color: 0xff4500,
          footer: { text: 'Reviewed' },
        };

        await interaction.update({ embeds: [embed], components: [] });
      }

      // Pending Button
      if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
        const embed = {
          title: 'Application Marked as Pending',
          description: `The application has been reviewed and is pending further action.`,
          color: 0xffd700,
          footer: { text: 'Reviewed' },
        };

        await interaction.update({ embeds: [embed], components: [] });

        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(PENDING_ROLE);
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
