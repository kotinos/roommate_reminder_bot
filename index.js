const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

// Function to read usernames from a schedule file (CSV format)
function getUsernamesFromSchedule(filename) {
  try {
    const fileContent = fs.readFileSync(filename, 'utf-8');
    return fileContent.split(','); // Split the CSV string into an array
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return []; // Return an empty array if there's an error
  }
}

// Function to get the next cleaner's Telegram username from schedule file
function getNextCleaner(area) {
  const scheduleFilename = `scheduleConfigs/${area}Schedule.txt`;
  try {
    // Read usernames from the schedule file
    let usernames = getUsernamesFromSchedule(scheduleFilename);

    if (usernames.length === 0) {
      console.error(`No cleaners found in ${scheduleFilename}.`);
      return null;
    }

    const username = usernames.shift(); // Remove the first username from the array
    usernames.push(username);
    fs.writeFileSync(scheduleFilename, usernames.join(','));

    return username;
  } catch (error) {
    console.error(`Error reading or writing ${scheduleFilename}:`, error);
    return null; // Return null if there's an error
  }
}

// Function to generate the message from the template
function generateMessage(username, area) {
  return `Reminder: @${username}, please clean the ${area} today.`;
}

// Main function
function main() {
  const areas = ['toilet', 'houseFloor'];

  areas.forEach((area) => {
    const username = getNextCleaner(area);
    if (username) {
      const message = generateMessage(username, area);

      // Send the message to the Telegram group
      bot.sendMessage(chatId, message)
          .then((response) => {
            console.log('Message sent:', response);
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });
    } else {
      console.error(`No cleaner found for ${area}.`);
    }
  });
}

// Invoke the main function when the script is executed
main();
