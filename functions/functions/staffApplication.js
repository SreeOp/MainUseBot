const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'apply') {
    const modal = new ModalBuilder()
      .setCustomId('staffApplicationModal')
      .setTitle('Staff Application');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Your full name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ageInput = new TextInputBuilder()
      .setCustomId('age')
      .setLabel('Your age')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const experienceInput = new TextInputBuilder()
      .setCustomId('experience')
      .setLabel('Your previous experience')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Why you want to be a staff member')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(ageInput),
      new ActionRowBuilder().addComponents(experienceInput),
      new ActionRowBuilder().addComponents(reasonInput)
    );

    await interaction.showModal(modal);
  } else if (interaction.customId === 'staffApplicationModal') {
    const name = interaction.fields.getTextInputValue('name');
    const age = interaction.fields.getTextInputValue('age');
    const experience = interaction.fields.getTextInputValue('experience');
    const reason = interaction.fields.getTextInputValue('reason');

    const logChannelId = process.env.STAFF_APPLICATION_CHANNEL_ID;

    if (!logChannelId) {
      console.error('Staff application log channel ID is not defined in the environment variables.');
      return;
    }

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
      console.error('Staff application log channel not found.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('New Staff Application')
      .addFields(
        { name: 'Name', value: name, inline: true },
        { name: 'Age', value: age, inline: true },
        { name: 'Experience', value: experience },
        { name: 'Reason', value: reason }
      )
      .setColor('BLUE')
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    } catch (error) {
      console.error('Error logging staff application:', error);
      await interaction.reply({ content: 'There was an error submitting your application.', ephemeral: true });
    }
  }
};
