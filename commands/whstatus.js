const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('statuswl')
    .setDescription('Set the status of the whitelist application.')
    .addStringOption((option) =>
      option
        .setName('choice')
        .setDescription('Choose the whitelist status')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Close', value: 'close' }
        )
    ),

  async execute(interaction, client) {
    const choice = interaction.options.getString('choice');
    const WHITELIST_CHANNEL = '1329106473070104676'; // Replace with your whitelist channel ID

    // Fetch the whitelist channel
    const channel = interaction.guild.channels.cache.get(WHITELIST_CHANNEL);
    if (!channel) {
      return interaction.reply({
        content: 'Whitelist channel not found. Please check the configuration.',
        ephemeral: true,
      });
    }

    // Fetch the last message in the whitelist channel (assuming it’s the whitelist embed)
    const messages = await channel.messages.fetch({ limit: 1 });
    const whitelistMessage = messages.first();
    if (!whitelistMessage) {
      return interaction.reply({
        content: 'No whitelist message found in the channel.',
        ephemeral: true,
      });
    }

    // Update the button based on the status
    const updatedButton = new client.discord.ButtonBuilder()
      .setCustomId('apply-whitelist')
      .setLabel('Apply')
      .setStyle(client.discord.ButtonStyle.Primary)
      .setDisabled(choice === 'close');

    const updatedRow = new client.discord.ActionRowBuilder().addComponents(
      updatedButton
    );

    const updatedEmbed = client.discord.EmbedBuilder.from(
      whitelistMessage.embeds[0]
    );

    await whitelistMessage.edit({
      embeds: [updatedEmbed],
      components: [updatedRow],
    });

    return interaction.reply({
      content: `Whitelist application is now **${choice.toUpperCase()}**.`,
      ephemeral: true,
    });
  },
};
