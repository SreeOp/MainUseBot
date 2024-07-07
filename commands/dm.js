const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a DM to a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to send a DM to')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const message = interaction.options.getString('message');

    try {
      await targetUser.send(message);
      await interaction.reply({ content: `Message sent to ${targetUser.tag}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to send the DM. The user might have DMs disabled.', ephemeral: true });
    }
  },
};
