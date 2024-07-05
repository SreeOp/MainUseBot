const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song name or URL')
                .setRequired(true)),
    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        const player = client.player.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            selfDeaf: true
        });

        if (player.state !== 'CONNECTED') player.connect();

        const [res] = await client.player.search(query, interaction.user);

        if (!res) return interaction.reply('No results found.');

        player.queue.add(res);
        if (!player.playing) player.play();
        
        await interaction.reply(`Now playing: **${res.info.title}**`);
    }
};
