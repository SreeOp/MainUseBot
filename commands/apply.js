const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageActionRow, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

const applicationChannelId = '1255162116126539786'; // Replace with your application channel ID
const acceptRoleId = '1253347271718735882'; // Replace with the role ID that has permission to accept applications

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Start the staff application process'),

    async execute(interaction) {
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('staffApplication')
            .setTitle('Staff Application');

        // Add questions to the modal
        const nameInput = new TextInputBuilder()
            .setCustomId('realName')
            .setLabel('What is your Real Name?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const characterNameInput = new TextInputBuilder()
            .setCustomId('characterName')
            .setLabel('What is your Character Name?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('What is your Email?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const experienceInput = new TextInputBuilder()
            .setCustomId('staffExperience')
            .setLabel('Explain your STAFF-EXPERIENCE')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Add the inputs to the modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(characterNameInput),
            new ActionRowBuilder().addComponents(emailInput),
            new ActionRowBuilder().addComponents(experienceInput)
        );

        // Show the modal to the user
        await interaction.showModal(modal);
    },

    async handleSubmission(interaction) {
        const realName = interaction.fields.getTextInputValue('realName');
        const characterName = interaction.fields.getTextInputValue('characterName');
        const email = interaction.fields.getTextInputValue('email');
        const staffExperience = interaction.fields.getTextInputValue('staffExperience');

        // Create the embed for the application
        const embed = new EmbedBuilder()
            .setTitle('New Staff Application')
            .setColor(0x0099ff) // Customize your color
            .addFields(
                { name: 'Real Name', value: realName },
                { name: 'Character Name', value: characterName },
                { name: 'Email', value: email },
                { name: 'Staff Experience', value: staffExperience }
            )
            .setTimestamp();

        // Create the accept button
        const acceptButton = new ButtonBuilder()
            .setCustomId('acceptApplication')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);

        const row = new MessageActionRow().addComponents(acceptButton);

        // Send the application to the application channel
        const applicationChannel = interaction.guild.channels.cache.get(applicationChannelId);
        if (applicationChannel) {
            await applicationChannel.send({ embeds: [embed], components: [row] });
        }

        await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    },

    async handleAccept(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to accept applications.', ephemeral: true });
        }

        // Retrieve the application data and user ID
        const applicationMessage = interaction.message;
        const applicantId = applicationMessage.interaction.user.id;

        // Send a DM to the user
        try {
            const user = await interaction.client.users.fetch(applicantId);
            await user.send('Congratulations! Your staff application has been accepted.');
            await interaction.update({ content: 'Application accepted and user notified.', components: [] });
        } catch (error) {
            console.error('Failed to send DM:', error);
            await interaction.reply({ content: 'Failed to send DM to the user.', ephemeral: true });
        }
    }
};
