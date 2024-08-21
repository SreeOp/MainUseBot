const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply for staff position'),

    async execute(interaction) {
        // Step 1: Send an image with "Apply" button
        const applyEmbed = new EmbedBuilder()
            .setTitle('Staff Application')
            .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=66c6a474&is=66c552f4&hm=469130726847260794179cc767a2a9ba509d6e8ec534532189435011894f653e&') // Replace with the actual image URL
            .setColor('#0099ff');

        const applyButton = new ButtonBuilder()
            .setCustomId('apply_button')
            .setLabel('Apply')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(applyButton);

        await interaction.reply({ embeds: [applyEmbed], components: [row], ephemeral: false });
    },
};

// Step 2: Handle the "Apply" button interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'apply_button') {
        const modal = new ModalBuilder()
            .setCustomId('staff_application')
            .setTitle('Staff Application');

        const realNameInput = new TextInputBuilder()
            .setCustomId('real_name')
            .setLabel('What is your Real Name?')
            .setStyle(TextInputStyle.Short);

        const characterNameInput = new TextInputBuilder()
            .setCustomId('character_name')
            .setLabel('What is your Character Name?')
            .setStyle(TextInputStyle.Short);

        const ageInput = new TextInputBuilder()
            .setCustomId('age')
            .setLabel('What is your Age?')
            .setStyle(TextInputStyle.Short);

        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('What is your E-mail?')
            .setStyle(TextInputStyle.Short);

        const experienceInput = new TextInputBuilder()
            .setCustomId('experience')
            .setLabel('Explain Your STAFF-EXPERIENCE')
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(realNameInput),
            new ActionRowBuilder().addComponents(characterNameInput),
            new ActionRowBuilder().addComponents(ageInput),
            new ActionRowBuilder().addComponents(emailInput),
            new ActionRowBuilder().addComponents(experienceInput)
        );

        await interaction.showModal(modal);
    }
});

// Step 3: Handle the form submission and send to specified channel
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'staff_application') {
        const realName = interaction.fields.getTextInputValue('real_name');
        const characterName = interaction.fields.getTextInputValue('character_name');
        const age = interaction.fields.getTextInputValue('age');
        const email = interaction.fields.getTextInputValue('email');
        const experience = interaction.fields.getTextInputValue('experience');

        const applicationEmbed = new EmbedBuilder()
            .setTitle('New Staff Application')
            .addFields(
                { name: 'Real Name', value: realName },
                { name: 'Character Name', value: characterName },
                { name: 'Age', value: age },
                { name: 'E-mail', value: email },
                { name: 'Experience', value: experience }
            )
            .setColor('#FF4D00');

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_application')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(acceptButton);

        const applicationChannel = interaction.guild.channels.cache.get('CHANNEL_ID_HERE'); // Replace with your channel ID
        await applicationChannel.send({ embeds: [applicationEmbed], components: [row] });

        await interaction.reply({ content: 'Application submitted!', ephemeral: true });
    }
});

// Step 4: Handle the "Accept" button interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'accept_application') {
        const userId = interaction.message.embeds[0].fields.find(field => field.name === 'User ID').value;
        const user = await client.users.fetch(userId);
        await user.send('Congratulations! Your staff application has been accepted.');
        await interaction.reply({ content: 'Application accepted and user notified.', ephemeral: true });
    }
});
