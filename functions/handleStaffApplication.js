const { MessageEmbed } = require('discord.js');
const config = require('../config'); // Import config

const questions = config.questions.apply;

module.exports = async (client, interaction) => {
  if (!interaction.isCommand()) return;

  const command = interaction.commandName;

  if (command === 'apply') {
    let currentQuestion = 0;
    const filter = response => response.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    await interaction.reply('I will now ask you a series of questions. Please respond to each one.');

    const askQuestion = async () => {
      if (currentQuestion < questions.length) {
        await interaction.followUp(questions[currentQuestion]);
      } else {
        collector.stop();
      }
    };

    askQuestion();

    const userAnswers = [];

    collector.on('collect', async response => {
      if (currentQuestion < questions.length) {
        userAnswers[currentQuestion] = response.content;
        currentQuestion++;
        if (currentQuestion < questions.length) {
          await askQuestion();
        } else {
          collector.stop();

          const answersEmbed = new MessageEmbed()
            .setTitle('Staff Application')
            .setDescription(`Here are the responses from ${interaction.user.tag}:`)
            .addFields(
              { name: 'Name', value: userAnswers[0] || 'Not provided', inline: true },
              { name: 'Age', value: userAnswers[1] || 'Not provided', inline: true },
              { name: 'Experience', value: userAnswers[2] || 'Not provided', inline: true }
            )
            .setColor('#0099ff');

          const applicationChannelId = config.applicationChannelId; // Get the application channel ID from config
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
