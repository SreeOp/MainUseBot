const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),
    async execute(interaction, client) {
        const player = client.player.get(interaction.guild.id);
        
        if (!player) return interaction.reply('No music is being played!');

        player.destroy();
        await interaction.reply('Stopped the music and cleared the queue.');
    }
};
