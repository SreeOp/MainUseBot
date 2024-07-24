const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'apply') {
      // Show job application menu
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ems')
          .setLabel('EMS')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('pd')
          .setLabel('PD')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: 'Select Job Application:',
        components: [row],
        ephemeral: true
      });
    } else if (interaction.customId === 'ems' || interaction.customId === 'pd') {
      const questions = interaction.customId === 'ems' ? [
        { question: 'Why do you want to join the EMS?', customId: 'q1' },
        { question: 'What experience do you have?', customId: 'q2' },
      ] : [
        { question: 'Why do you want to join the PD?', customId: 'q1' },
        { question: 'What experience do you have?', customId: 'q2' },
      ];

      for (const { question, customId } of questions) {
        const modal = new ModalBuilder()
          .setCustomId(`modal_${customId}`)
          .setTitle('Job Application')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(customId)
                .setLabel(question)
                .setStyle(TextInputStyle.Paragraph)
            )
          );

        await interaction.showModal(modal);
      }
    }
  } else if (interaction.isModalSubmit()) {
    const channelId = process.env.APPLICATIONS_CHANNEL_ID;
    const applicationChannel = client.channels.cache.get(channelId);

    const answers = [];
    for (const component of interaction.components) {
      const input = component.components[0];
      answers.push(`${input.label}: ${interaction.fields.getTextInputValue(input.customId)}`);
    }

    const applicantId = interaction.user.id;
    const applicantTag = interaction.user.tag;

    await applicationChannel.send({
      content: `New application submitted by <@${applicantId}> (${applicantTag}):\n\n${answers.join('\n')}`
    });

    await interaction.reply({ content: 'Application submitted!', ephemeral: true });
  }
};
