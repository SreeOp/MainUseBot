const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const WHITELIST_CHANNEL = '1329106473070104676'; // Replace with your whitelist channel ID
let isWhitelistOpen = true; // Tracks the current state of the whitelist

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statuswl')
    .setDescription('Manage the status of the whitelist application.')
    .addStringOption((option) =>
      option
        .setName('choice')
        .setDescription('Set the whitelist status to open or close.')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Close', value: 'close' }
        )
    ),

  async execute(interaction) {
    const choice = interaction.options.getString('choice');
    const channel = interaction.guild.channels.cache.get(WHITELIST_CHANNEL);

    if (!channel) {
      return interaction.reply({
        content: 'Whitelist channel not found. Please configure the correct channel.',
        ephemeral: true,
      });
    }

    if (choice === 'open') {
      isWhitelistOpen = true;

      // Update the whitelist embed with the active Apply button
      const embed = new EmbedBuilder()
        .setTitle('Whitelist Application')
        .setDescription('Click the **Apply** button to start your whitelist application.')
        .setColor('#00FF00')
        .setFooter({ text: 'Whitelist is currently OPEN.' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('apply-whitelist')
          .setLabel('Apply')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false) // Enable the button
      );

      await channel.messages.fetch({ limit: 10 }).then(async (messages) => {
        const whitelistMessage = messages.find((msg) =>
          msg.embeds[0]?.title === 'Whitelist Application'
        );
        if (whitelistMessage) {
          await whitelistMessage.edit({ embeds: [embed], components: [row] });
        }
      });

      return interaction.reply({
        content: 'Whitelist applications are now **open**.',
        ephemeral: true,
      });
    }

    if (choice === 'close') {
      isWhitelistOpen = false;

      // Update the whitelist embed with the disabled Apply button
      const embed = new EmbedBuilder()
        .setTitle('Whitelist Application')
        .setDescription(
          'Whitelist applications are currently **closed**. Please check back later.'
        )
        .setColor('#FF0000')
        .setFooter({ text: 'Whitelist is currently CLOSED.' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('apply-whitelist')
          .setLabel('Apply')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true) // Disable the button
      );

      await channel.messages.fetch({ limit: 10 }).then(async (messages) => {
        const whitelistMessage = messages.find((msg) =>
          msg.embeds[0]?.title === 'Whitelist Application'
        );
        if (whitelistMessage) {
          await whitelistMessage.edit({ embeds: [embed], components: [row] });
        }
      });

      return interaction.reply({
        content: 'Whitelist applications are now **closed**.',
        ephemeral: true,
      });
    }
  },
};
