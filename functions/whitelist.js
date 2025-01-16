const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = (client) => {
  const APPLICATION_CHANNEL = '1255162116126539786'; // Replace with the ID of the channel where applications are sent
  const PENDING_CHANNEL = '1313134410282962996'; // Replace with the ID of the "pending" log channel
  const REJECT_CHANNEL = '1313134410282962996'; // Replace with the ID of the "reject" log channel

  const PENDING_ROLE = '1253347271718735882'; // Replace with the role ID for pending users
  const WHITELIST_MANAGER_ROLE = '1046786167644880946'; // Replace with the whitelist manager role ID

  const PENDING_IMAGE = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/images/dav_1-1.gif'; // Replace with the URL of the image for pending
  const REJECT_IMAGE = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/images/dav_1-1.gif'; // Replace with the URL of the image for rejection

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

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'apply-whitelist') {
      const modal = new ModalBuilder()
        .setCustomId('whitelist-application')
        .setTitle('Whitelist Application');

      const questions = [
  { id: 'real-name', label: 'Real Name' },
  { id: 'real-age', label: 'Real Age', minLength: 2, maxLength: 2 }, // 2 characters only
  { id: 'character-name', label: 'Character Name' },
  { id: 'back-story', label: 'Backstory', minLength: 100 }, // Minimum 100 characters
  { id: 'roleplay-experience', label: 'Roleplay Experience', maxLength: 9 }, // Maximum 9 characters
  { id: 'read-rules', label: 'Did you read the rules (yes/no)?', maxLength: 3 }, // Maximum 3 characters
];

questions.forEach((q) => {
  const textInput = new TextInputBuilder()
    .setCustomId(q.id)
    .setLabel(q.label)
    .setStyle(
      q.id === 'back-story' ? TextInputStyle.Paragraph : TextInputStyle.Short // Use Paragraph for long text
    );

  // Set minimum and maximum lengths if defined
  if (q.minLength) textInput.setMinLength(q.minLength);
  if (q.maxLength) textInput.setMaxLength(q.maxLength);

  modal.addComponents(
    new ActionRowBuilder().addComponents(textInput)
  );
});

await interaction.showModal(modal);

if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
  const answers = [
    interaction.fields.getTextInputValue('real-name'),
    interaction.fields.getTextInputValue('real-age'),
    interaction.fields.getTextInputValue('character-name'),
    interaction.fields.getTextInputValue('back-story'), // Get Backstory input
    interaction.fields.getTextInputValue('roleplay-experience'),
    interaction.fields.getTextInputValue('read-rules'),
  ];

  const embed = new EmbedBuilder()
    .setTitle('Whitelist Application Submitted')
    .setDescription(
      `<@${interaction.user.id}> has submitted an application.\nWhitelist Manager Role: <@&${WHITELIST_MANAGER_ROLE}>`
    )
    .addFields(
      { name: 'Real Name', value: answers[0] },
      { name: 'Real Age', value: answers[1] },
      { name: 'Character Name', value: answers[2] },
      { name: 'Backstory', value: answers[3] }, // Include Backstory in the embed
      { name: 'Roleplay Experience', value: answers[4] },
      { name: 'Read Rules', value: answers[5] }
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setColor('#FFD700');

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
        content: `<@&${WHITELIST_MANAGER_ROLE}>`,
        embeds: [embed],
        components: [actionRow],
      });

      await interaction.reply({
        content: 'Your application has been submitted.',
        ephemeral: true,
      });
    }

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

    if (interaction.isModalSubmit() && interaction.customId === 'reject-reason-modal') {
      const reason = interaction.fields.getTextInputValue('reject-reason');
      const targetMessage = await interaction.message.fetch();

      const user = targetMessage.embeds[0].footer.text.match(/\d+/)[0];
      const member = await interaction.guild.members.fetch(user);
      const logChannel = interaction.guild.channels.cache.get(REJECT_CHANNEL);

      const embed = new EmbedBuilder()
        .setTitle('Whitelist Rejected')
        .setDescription(
          `User: <@${user}>\nWhitelist Manager: <@${interaction.user.id}>\nReason: ${reason}`
        )
        .setImage(REJECT_IMAGE)
        .setColor('#FF4500');

      await logChannel.send({ embeds: [embed] });

      const updatedEmbed = EmbedBuilder.from(targetMessage.embeds[0])
        .setFooter({ text: 'Done' });

      await targetMessage.edit({
        embeds: [updatedEmbed],
        components: [],
      });

      await interaction.reply({
        content: `You rejected the whitelist application for <@${user}>.`,
        ephemeral: true,
      });
    }

    if (interaction.isButton() && interaction.customId === 'pending-whitelist') {
      const targetMessage = await interaction.message.fetch();

      const user = targetMessage.embeds[0].footer.text.match(/\d+/)[0];
      const member = await interaction.guild.members.fetch(user);
      const logChannel = interaction.guild.channels.cache.get(PENDING_CHANNEL);

      const embed = new EmbedBuilder()
        .setTitle('Whitelist Pending')
        .setDescription(
          `User: <@${user}>\nWhitelist Manager: <@${interaction.user.id}>`
        )
        .setImage(PENDING_IMAGE)
        .setColor('#FFD700');

      await logChannel.send({ embeds: [embed] });

      await member.roles.add(PENDING_ROLE);

      const updatedEmbed = EmbedBuilder.from(targetMessage.embeds[0])
        .setFooter({ text: 'Done' });

      await targetMessage.edit({
        embeds: [updatedEmbed],
        components: [],
      });

      await interaction.reply({
        content: `You marked the whitelist application for <@${user}> as pending.`,
        ephemeral: true,
      });
    }
  });

  return initializeWhitelistMessage;
};
