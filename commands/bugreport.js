const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bugreport')
    .setDescription('Report a bug or issue with the bot or server'),

  async execute(interaction) {
    const reportChannelId = '1255162116126539786'; // Replace with the ID of the channel to send reports to
    const imageUrl = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an image related to bug reporting

    // Initial message embed with "Report" button
    const embed = new EmbedBuilder()
      .setTitle('Bug Report')
      .setDescription('Encountered an issue? Click the "Report" button to describe it.')
      .setImage(imageUrl)
      .setColor('#FF5733');

    // Report button to open the modal
    const reportButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('report_button')
        .setLabel('Report')
        .setStyle(ButtonStyle.Primary)
    );

    // Send the embed with the button
    await interaction.channel.send({ embeds: [embed], components: [reportButton] });

    // Listener for button interaction
    const filter = i => i.customId === 'report_button' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      // Modal for bug report input
      const modal = new ModalBuilder()
        .setCustomId('report_modal')
        .setTitle('Bug Report');

      const issueInput = new TextInputBuilder()
        .setCustomId('issue_description')
        .setLabel("Describe the issue you're experiencing")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide details about the bug')
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(issueInput);
      modal.addComponents(actionRow);

      await i.showModal(modal);
    });

    // Handle modal submission
    interaction.client.on('interactionCreate', async modalInteraction => {
      if (!modalInteraction.isModalSubmit()) return;
      if (modalInteraction.customId === 'report_modal') {
        const issueDescription = modalInteraction.fields.getTextInputValue('issue_description');

        // Send the report to the specified channel
        const reportChannel = await interaction.client.channels.fetch(reportChannelId);
        const reportEmbed = new EmbedBuilder()
          .setTitle('New Bug Report')
          .setDescription(`**Reporter:** <@${interaction.user.id}>\n**Issue:**\n${issueDescription}`)
          .setColor('#FF0000')
          .setTimestamp();

        await reportChannel.send({ embeds: [reportEmbed] });

        // Confirm to the user
        await modalInteraction.reply({ content: 'Thank you! Your report has been submitted.', ephemeral: true });
      }
    });
  },
};
