const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    let modal;
    if (interaction.customId === 'apply_ems') {
      modal = new ModalBuilder()
        .setCustomId('ems_application')
        .setTitle('EMS Application')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('question1')
              .setLabel('Why do you want to join EMS?')
              .setStyle(TextInputStyle.Paragraph)
          )
        );
    } else if (interaction.customId === 'apply_pd') {
      modal = new ModalBuilder()
        .setCustomId('pd_application')
        .setTitle('PD Application')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('question1')
              .setLabel('Why do you want to join PD?')
              .setStyle(TextInputStyle.Paragraph)
          )
        );
    }
    await interaction.showModal(modal);
  } else if (interaction.isModalSubmit()) {
    const answer = interaction.fields.getTextInputValue('question1');
    const applicationChannelId = process.env.APPLICATION_CHANNEL_ID;
    const applicationChannel = client.channels.cache.get(applicationChannelId);

    if (applicationChannel) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accept_application')
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reject_application')
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger)
      );

      await applicationChannel.send({
        content: `New application from ${interaction.user.tag}\n**Answer:** ${answer}`,
        components: [row],
      });

      await interaction.reply({ content: 'Application submitted!', ephemeral: true });
    }
  }
};
