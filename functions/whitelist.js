const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Channel where applications are sent
  const ACCEPT_CHANNEL = '1313134410282962996'; // "Accept" log channel
  const PENDING_CHANNEL = '1303269751166079036'; // "Pending" log channel
  const REJECT_CHANNEL = '1316963699029704724'; // "Reject" log channel

  const ACCEPT_ROLE = '1253347204601741342'; // Role for accepted users
  const PENDING_ROLE = '1253347271718735882'; // Role for pending users

  // Function to handle button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, message } = interaction;
    if (!customId.startsWith('application-')) return;

    const action = customId.split('-')[1]; // accept, reject, pending
    const applicantId = message.embeds[0]?.description?.match(/<@(\d+)>/)?.[1]; // Extract applicant ID
    const whitelistManagerId = interaction.user.id;

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setFooter({ text: 'Whitelist Application Manager' });

    // Assign channels and roles
    const logChannelId =
      action === 'accept'
        ? ACCEPT_CHANNEL
        : action === 'reject'
        ? REJECT_CHANNEL
        : PENDING_CHANNEL;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);

    const roles = {
      accept: ACCEPT_ROLE,
      pending: PENDING_ROLE,
    };

    try {
      // Action logic
      switch (action) {
        case 'accept':
          embed
            .setTitle('Whitelist Application Accepted')
            .setDescription(
              `**User:** <@${applicantId}>\n**Actioned by:** <@${whitelistManagerId}>`
            );

          await interaction.guild.members.cache
            .get(applicantId)
            ?.roles.add(roles.accept);
          await interaction.guild.members.cache
            .get(applicantId)
            ?.roles.remove(roles.pending);
          break;

        case 'reject':
          embed
            .setTitle('Whitelist Application Rejected')
            .setDescription(
              `**User:** <@${applicantId}>\n**Actioned by:** <@${whitelistManagerId}>`
            );
          break;

        case 'pending':
          embed
            .setTitle('Whitelist Application Pending')
            .setDescription(
              `**User:** <@${applicantId}>\n**Actioned by:** <@${whitelistManagerId}>`
            );

          await interaction.guild.members.cache
            .get(applicantId)
            ?.roles.add(roles.pending);
          break;

        default:
          return;
      }

      // Send the embed to the appropriate log channel
      await logChannel.send({ embeds: [embed] });

      // Disable buttons after interaction
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('application-accept')
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('application-pending')
          .setLabel('Pending')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('application-reject')
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );

      // Update the original message
      await interaction.update({ components: [disabledRow] });
    } catch (error) {
      console.error('Error handling whitelist action:', error);
    }
  });

  // Function to send the application embed
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'setwhitelist') return;

    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Click the button below to apply for a whitelist.')
      .setColor('#00FF00');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  });

  // Function to handle "Apply" button
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'apply') return;

    const modal = new ModalBuilder()
      .setCustomId('whitelist-application')
      .setTitle('Whitelist Application')
      .addComponents(
        new TextInputBuilder()
          .setCustomId('realName')
          .setLabel('What is your real name?')
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId('realAge')
          .setLabel('What is your real age?')
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId('characterName')
          .setLabel('What is your character name?')
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId('rpExperience')
          .setLabel('What is your roleplay experience?')
          .setStyle(TextInputStyle.Paragraph),
        new TextInputBuilder()
          .setCustomId('readRules')
          .setLabel('Did you read the rules? (Yes/No)')
          .setStyle(TextInputStyle.Short)
      );

    await interaction.showModal(modal);
  });

  // Handle modal submission
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'whitelist-application') return;

    const realName = interaction.fields.getTextInputValue('realName');
    const realAge = interaction.fields.getTextInputValue('realAge');
    const characterName = interaction.fields.getTextInputValue('characterName');
    const rpExperience = interaction.fields.getTextInputValue('rpExperience');
    const readRules = interaction.fields.getTextInputValue('readRules');

    const applicationEmbed = new EmbedBuilder()
      .setTitle('New Whitelist Application')
      .setDescription(
        `**Real Name:** ${realName}\n**Real Age:** ${realAge}\n**Character Name:** ${characterName}\n**Roleplay Experience:** ${rpExperience}\n**Did you read the rules?** ${readRules}\n\n**Submitted by:** <@${interaction.user.id}>`
      )
      .setColor('#FFFF00');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('application-accept')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('application-pending')
        .setLabel('Pending')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('application-reject')
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger)
    );

    const channel = interaction.guild.channels.cache.get(APPLICATION_CHANNEL);
    await channel.send({
      embeds: [applicationEmbed],
      components: [row],
    });

    await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
  });
};
