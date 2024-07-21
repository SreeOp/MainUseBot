const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'apply') {
        const modal = new ModalBuilder()
          .setCustomId('staffApplication')
          .setTitle('Staff Application');

        const questions = [
          { id: 'name', label: 'What is your name?' },
          { id: 'age', label: 'How old are you?' },
          { id: 'experience', label: 'Do you have any prior experience?' },
          { id: 'reason', label: 'Why do you want to be a staff member?' },
        ];

        if (questions.length === 0) {
          console.error('No questions found to add to the modal.');
          return;
        }

        const components = questions.map(question => new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(question.id)
            .setLabel(question.label)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ));

        modal.setComponents(components);

        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'staffApplication') {
        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const experience = interaction.fields.getTextInputValue('experience');
        const reason = interaction.fields.getTextInputValue('reason');

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('New Staff Application')
            .setColor('#00FF00') // Ensure the color is a valid hexadecimal color code
            .addFields(
              { name: 'Name', value: name, inline: true },
              { name: 'Age', value: age, inline: true },
              { name: 'Experience', value: experience, inline: false },
              { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('accept')
              .setLabel('Accept')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('reject')
              .setLabel('Reject')
              .setStyle(ButtonStyle.Danger)
          );

          await logChannel.send({ embeds: [embed], components: [buttons] });
        } else {
          console.error('Log channel not found.');
        }

        await interaction.reply({ content: 'Thank you for your application! We will review it and get back to you soon.', ephemeral: true });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'accept' || interaction.customId === 'reject') {
        const buttonType = interaction.customId;
        const embed = interaction.message.embeds[0];
        const applicantId = embed.fields.find(field => field.name === 'Name').value;

        if (!applicantId) {
          console.error('Applicant ID not found in the message embed.');
          return;
        }

        const applicant = await client.users.fetch(applicantId);

        if (applicant) {
          try {
            if (buttonType === 'accept') {
              await applicant.send('Your staff application has been accepted. Please come to the voice channel for further instructions.');
              await interaction.update({ content: 'Application accepted and user notified!', components: [] });
            } else if (buttonType === 'reject') {
              await interaction.update({ content: 'Application rejected!', components: [] });
            }
          } catch (dmError) {
            console.error('Failed to send DM:', dmError);
            if (!interaction.replied) {
              await interaction.reply({ content: 'Failed to notify the user.', ephemeral: true });
            }
          }
        } else {
          console.error('Applicant not found.');
          if (!interaction.replied) {
            await interaction.reply({ content: 'Failed to accept the application. Applicant not found.', ephemeral: true });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
};
