const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { channelId, questions } = require('./config'); // Define your questions and application channel ID in config

module.exports = {
  async handleInteraction(interaction) {
    if (!interaction.isButton()) return;

    const { customId, user } = interaction;

    // Check which button was clicked
    let role;
    if (customId === 'apply_staff') role = 'Staff';
    if (customId === 'apply_vehicle') role = 'Vehicle Developer';
    if (customId === 'apply_developer') role = 'Developer';

    // Send DM with questions
    const questionsToAsk = questions[role] || [];
    let questionsAnswered = 0;

    try {
      user.send('You have started an application process. Please answer the following questions:');

      for (const question of questionsToAsk) {
        const filter = response => response.author.id === user.id;
        await user.send(question);

        const collected = await user.dmChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
        const answer = collected.first().content;
        questionsAnswered++;
        user.send(`Question ${questionsAnswered}: ${answer}`);
      }

      // Send application to the application review channel
      const reviewChannel = await interaction.client.channels.fetch(channelId);
      const embed = new MessageEmbed()
        .setTitle('New Application')
        .setDescription(`**Role Applied:** ${role}\n**User:** ${user.tag}\n**Answers:**\n${questionsToAsk.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answer}`).join('\n')}`)
        .setColor('#00FF00');

      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('accept_application')
            .setLabel('Accept')
            .setStyle('SUCCESS'),
          new MessageButton()
            .setCustomId('reject_application')
            .setLabel('Reject')
            .setStyle('DANGER')
        );

      await reviewChannel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    } catch (error) {
      console.error('Error during application process:', error);
      await interaction.reply({ content: 'There was an error processing your application!', ephemeral: true });
    }
  }
};
