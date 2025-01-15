const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require('discord.js');

module.exports = (client) => {
  const WHITELIST_CHANNEL = '1329106473070104676'; // Replace with the ID of the channel where the whitelist embed is sent

  // Store the status of the whitelist button
  let whitelistStatus = 'open';

  // Register the /statuswl command
  client.on('ready', () => {
    client.application.commands.create(
      new SlashCommandBuilder()
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
        )
    );
  });

  // Handle the /statuswl command
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === 'statuswl') {
      const choice = interaction.options.getString('choice');

      // Update whitelist status
      whitelistStatus = choice;

      // Get the whitelist channel
      const channel = interaction.guild.channels.cache.get(WHITELIST_CHANNEL);
      if (!channel) {
        return interaction.reply({
          content: 'Whitelist channel not found. Please check the configuration.',
          ephemeral: true,
        });
      }

      // Fetch the last message in the whitelist channel (assuming it's the whitelist embed)
      const messages = await channel.messages.fetch({ limit: 1 });
      const whitelistMessage = messages.first();
      if (!whitelistMessage) {
        return interaction.reply({
          content: 'No whitelist message found in the channel.',
          ephemeral: true,
        });
      }

      // Update the button based on the status
      const updatedButton = new ButtonBuilder()
        .setCustomId('apply-whitelist')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(choice === 'close');

      const updatedRow = new ActionRowBuilder().addComponents(updatedButton);

      const updatedEmbed = EmbedBuilder.from(whitelistMessage.embeds[0]);
      await whitelistMessage.edit({
        embeds: [updatedEmbed],
        components: [updatedRow],
      });

      return interaction.reply({
        content: `Whitelist application is now **${choice.toUpperCase()}**.`,
        ephemeral: true,
      });
    }
  });

  // Initialize the whitelist embed message
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
        .setDisabled(whitelistStatus === 'close') // Set button state based on the status
    );

    await channel.send({ embeds: [embed], components: [row] });
  };

  return initializeWhitelistMessage;
};
