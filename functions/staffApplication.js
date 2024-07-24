// functions/staffApplication.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.isSelectMenu() && interaction.customId === 'select_position') {
    const user = interaction.user;
    const position = interaction.values[0];

    // Define questions based on the position
    const questions = {
      staff: ['Why do you want to be a staff member?', 'What experience do you have?'],
      vehicle_developer: ['Why do you want to be a vehicle developer?', 'What experience do you have?'],
      map_developer: ['Why do you want to be a map developer?', 'What experience do you have?'],
      assistance: ['Why do you need assistance?', 'What kind of assistance do you require?'],
    };

    // Send questions via DM
    try {
      await user.send('You selected: ' + position);
      for (const question of questions[position]) {
        await user.send(question);
      }
      await user.send('Please reply to each question in separate messages.');
      await interaction.reply({ content: 'Questions sent to your DM!', ephemeral: true });
    } catch (error) {
      console.error('Could not send DM to the user.', error);
      await interaction.reply({ content: 'Could not send DM. Please ensure your DMs are open.', ephemeral: true });
      return;
    }

    // Collect answers
    const filter = response => response.author.id === user.id;
    const dmChannel = await user.createDM();
    const collected = await dmChannel.awaitMessages({ filter, max: questions[position].length, time: 60000, errors: ['time'] });

    let answers = [];
    collected.forEach(message => answers.push(message.content));

    // Send answers to a specified channel
    const applicationChannel = interaction.guild.channels.cache.get(process.env.APPLICATION_CHANNEL_ID);
    if (applicationChannel) {
      const acceptButton = new ButtonBuilder()
        .setCustomId('accept_application')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success);

      const rejectButton = new ButtonBuilder()
        .setCustomId('reject_application')
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(acceptButton, rejectButton);

      await applicationChannel.send({
        content: `Application for ${position}:\n\n${answers.map((answer, index) => `${questions[position][index]}: ${answer}`).join('\n')}`,
        components: [row],
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'accept_application') {
      await interaction.update({ content: 'Application accepted.', components: [] });
    } else if (interaction.customId === 'reject_application') {
      await interaction.update({ content: 'Application rejected.', components: [] });
    }
  }
};
