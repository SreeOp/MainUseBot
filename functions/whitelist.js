const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the ID of the channel where applications are sent
  const ACCEPT_CHANNEL = '1313134410282962996'; // Replace with the ID of the "accept" log channel
  const PENDING_CHANNEL = '1303269751166079036'; // Replace with the ID of the "pending" log channel
  const REJECT_CHANNEL = '1316963699029704724'; // Replace with the ID of the "reject" log channel

  const ACCEPT_ROLE = '1253347204601741342'; // Replace with the role ID for accepted users
  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID for pending users

  // Function to initialize the whitelist embed message
  const initializeWhitelistMessage = async (channel) => {
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Click the **Apply** button to start your whitelist application.')
      .setColor('#FF4500');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply-whitelist')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
  };

  // Handle interaction creation
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
      // Create a modal for the application
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

    // Handle modal submission
    if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
      const answers = [
        interaction.fields.getTextInputValue('real-name'),
        interaction.fields.getTextInputValue('real-age'),
        interaction.fields.getTextInputValue('character-name'),
        interaction.fields.getTextInputValue('roleplay-experience'),
        interaction.fields.getTextInputValue('read-rules'),
      ];

      const embed = new EmbedBuilder()
        .setTitle('Whitelist Application Submitted')
        .addFields(
          { name: 'Real Name', value: answers[0] },
          { name: 'Real Age', value: answers[1] },
          { name: 'Character Name', value: answers[2] },
          { name: 'Roleplay Experience', value: answers[3] },
          { name: 'Read Rules', value: answers[4] }
        )
        .setFooter({ text: `User ID: ${interaction.user.id}` })
        .setColor('#FFD700');

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accept-whitelist')
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success),
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
        embeds: [embed],
        components: [actionRow],
      });

      await interaction.reply({
        content: 'Your application has been submitted.',
        ephemeral: true,
      });
    }

    // Handle accept, pending, and reject actions
    if (
      interaction.isButton() &&
      ['accept-whitelist', 'pending-whitelist', 'reject-whitelist'].includes(interaction.customId)
    ) {
      const targetMessage = await interaction.message.fetch();

      const logChannel =
        interaction.customId === 'accept-whitelist'
          ? interaction.guild.channels.cache.get(ACCEPT_CHANNEL)
          : interaction.customId === 'pending-whitelist'
          ? interaction.guild.channels.cache.get(PENDING_CHANNEL)
          : interaction.guild.channels.cache.get(REJECT_CHANNEL);

      const targetRole =
        interaction.customId === 'accept-whitelist'
          ? ACCEPT_ROLE
          : interaction.customId === 'pending-whitelist'
          ? PENDING_ROLE
          : null;

      const user = targetMessage.embeds[0].footer.text.match(/\d+/)[0];
      const member = await interaction.guild.members.fetch(user);

      const embed = new EmbedBuilder()
        .setTitle('Whitelist Decision')
        .setDescription(
          `User: <@${user}>\nWhitelist Manager: <@${interaction.user.id}>`
        )
        .setColor(
          interaction.customId === 'accept-whitelist'
            ? '#32CD32'
            : interaction.customId === 'pending-whitelist'
            ? '#FFD700'
            : '#FF4500'
        );

      await logChannel.send({ embeds: [embed] });

      if (targetRole) {
        await member.roles.add(targetRole);
      }

      if (interaction.customId === 'accept-whitelist') {
        await member.roles.remove(PENDING_ROLE);
      }

      await interaction.reply({
        content: `The whitelist application for <@${user}> has been marked as **${interaction.customId.replace(
          '-whitelist',
          ''
        )}**.`,
        ephemeral: true,
      });
    }
  });

  return initializeWhitelistMessage;
};
