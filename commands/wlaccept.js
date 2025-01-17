const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acceptwl')
    .setDescription('Accept a whitelist application.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to accept.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user'); // Get the user to accept
    const member = interaction.guild.members.cache.get(user.id); // Fetch the member in the guild

    const ACCEPT_ROLE = '1253347204601741342'; // Replace with the ID of the "accepted" role
    const OLD_ROLE = '1253347271718735882'; // Replace with the ID of the old role to remove
    const ACCEPT_CHANNEL = '1313134410282962996'; // Replace with the ID of the channel to log accept messages
    const IMAGE_URL = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/images/dav_1-1.gif'; // Replace with your image URL

    // Check if the accept channel exists
    const acceptChannel = interaction.guild.channels.cache.get(ACCEPT_CHANNEL);
    if (!acceptChannel) {
      return interaction.reply({
        content: 'Accept channel not found. Please configure the correct channel.',
        ephemeral: true,
      });
    }

    // Assign the "accepted" role and remove the old role if it exists
    try {
      if (OLD_ROLE && member.roles.cache.has(OLD_ROLE)) {
        await member.roles.remove(OLD_ROLE);
      }
      await member.roles.add(ACCEPT_ROLE);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `Failed to update roles for <@${user.id}>.`,
        ephemeral: true,
      });
    }

    // Create and send the embed message
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Accept')
      .setDescription(
        `**User**: <@${user.id}>\n**Whitelist Manager**: <@${interaction.user.id}>`
      )
      .setColor('Green')
      .setImage(IMAGE_URL);

    await acceptChannel.send({ embeds: [embed] });

    // Reply to confirm the command
    return interaction.reply({
      content: `<@${user.id}> has been successfully whitelisted!`,
      ephemeral: true,
    });
  },
};
