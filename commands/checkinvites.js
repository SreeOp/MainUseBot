const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkinvites')
        .setDescription('Check your or another user\'s invites.')
        .addUserOption(option => 
            option.setName('user')
                  .setDescription('The user to check invites for')
                  .setRequired(false)),
    async execute(interaction) {
        // Get the guild and member
        const guild = interaction.guild;
        const member = interaction.options.getMember('user') || interaction.member;

        try {
            // Fetch all invites of the guild
            const invites = await guild.invites.fetch();
            // Calculate the total number of uses for invites created by the member
            const userInvites = invites.filter(inv => inv.inviter.id === member.id);
            const totalUses = userInvites.reduce((acc, invite) => acc + invite.uses, 0);

            // Reply with the total number of invites
            interaction.reply(`${member.displayName} has ${totalUses} invite(s).`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Failed to fetch invites.', ephemeral: true });
        }
    },
};
