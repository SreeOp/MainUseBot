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

        const components = questions.map(question => new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(question.id)
            .setLabel(question.label)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ));

        modal.addComponents(...components);

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
      const logChannelId = process.env.LOG_CHANNEL_ID;
      const notifyChannelId = process.env.NOTIFY_CHANNEL_ID;
      const notifyChannel = client.channels.cache.get(notifyChannelId);

      if (interaction.customId === 'accept') {
        const applicantId = interaction.message.embeds[0].fields.find(field => field.name === 'Name').value;

        const applicant = await client.users.fetch(applicantId);
        if (applicant && notifyChannel) {
          await notifyChannel.send(`@${applicant.tag} Your Staff Application Is Pending Now, Come To VC For Approval`);
          await interaction.update({ content: 'Application accepted!', components: [] });
        } else {
          console.error('Applicant or notify channel not found.');
          await interaction.reply({ content: 'Failed to accept the application. Please try again later.', ephemeral: true });
        }
      } else if (interaction.customId === 'reject') {
        await interaction.update({ content: 'Application rejected!', components: [] });
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
};
