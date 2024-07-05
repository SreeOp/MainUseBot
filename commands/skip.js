const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    async execute(interaction, client) {
        const player = client.player.get(interaction.guild.id);

        if (!player) return interaction.reply('No music is being played!');

        player.stop();
        await interaction.reply('Skipped the current song.');
    }
};
