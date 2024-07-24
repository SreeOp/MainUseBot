const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const questions = [
  'What Is Your Name?',
  'Age',
  'Experience'
];

module.exports = async (client, interaction) => {
  // Ensure the interaction is a command
  if (!interaction.isCommand()) return;

  const command = interaction.commandName;

  if (command === 'apply') {
    // Send questions to the user
    let currentQuestion = 0;
    const filter = response => {
      return response.author.id === interaction.user.id;
    };

    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    await interaction.reply('I will now ask you a series of questions. Please respond to each one.');

    // Ask the first question
    const askQuestion = async () => {
      if (currentQuestion < questions.length) {
        await interaction.followUp(questions[currentQuestion]);
      } else {
        collector.stop();
      }
    };

    askQuestion();

    collector.on('collect', async response => {
      const userAnswers = [];

      if (currentQuestion < questions.length) {
        userAnswers[currentQuestion] = response.content;
        currentQuestion++;
        if (currentQuestion < questions.length) {
          await askQuestion();
        } else {
          collector.stop();
          // Create an embed with the user's responses
          const answersEmbed = new MessageEmbed()
            .setTitle('Staff Application')
            .setDescription(`Here are the responses from ${interaction.user.tag}:`)
            .addFields(
              { name: 'Name', value: userAnswers[0] || 'Not provided', inline: true },
              { name: 'Age', value: userAnswers[1] || 'Not provided', inline: true },
              { name: 'Experience', value: userAnswers[2] || 'Not provided', inline: true }
            )
            .setColor('#0099ff');

          // Send the responses to a designated channel
          const applicationChannelId = process.env.APPLICATION_CHANNEL_ID; // Define in .env file
          const applicationChannel = await client.channels.fetch(applicationChannelId);
          
          if (applicationChannel) {
            await applicationChannel.send({ content: `<@${interaction.user.id}>`, embeds: [answersEmbed] });
            await interaction.followUp('Thank you for your application! Your responses have been sent.');
          } else {
            await interaction.followUp('Error: Application channel not found.');
          }
        }
      }
    });

    collector.on('end', collected => {
      if (currentQuestion < questions.length) {
        interaction.followUp('You did not complete the application within the time limit.');
      }
    });
  }
};
