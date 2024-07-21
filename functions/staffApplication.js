const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'apply') {
      const modal = new ModalBuilder()
        .setCustomId('staffApplication')
        .setTitle('Staff Application');

      const questions = [
        {
          id: 'name',
          label: 'What is your name?',
        },
        {
          id: 'age',
          label: 'How old are you?',
        },
        {
          id: 'experience',
          label: 'Do you have any prior experience?',
        },
        {
          id: 'reason',
          label: 'Why do you want to be a staff member?',
        },
      ];

      const components = questions.map(question => {
        return new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(question.id)
            .setLabel(question.label)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        );
      });

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
            { name: 'Reason', value: reason, inline: false },
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      await interaction.reply({ content: 'Thank you for your application! We will review it and get back to you soon.', ephemeral: true });
    }
  }
};
