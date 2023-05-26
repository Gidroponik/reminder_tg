const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');


const reminderKeys = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: 'Создать напоминание' }],
      [{ text: 'Список напоминаний' }],
      [{ text: 'Удалить напоминание' }],
      [{ text: 'Время сервера' }]
    ],
    one_time_keyboard: true
  })
};

const ReminderCreation = require('./reminderCreation'); /* Создать новое Напоминание */
const ReminderList = require('./reminderList'); /* Список Напоминаний */
const ReminderDeletion = require('./reminderDeletion');  /* Удаление напоминаний */
let creationSessions = {};
let deletionSessions = {};

// replace with your token
const bot = new TelegramBot('<YOU API TELEGRAM BOT>', {polling: true});

let reminders = JSON.parse(fs.readFileSync('reminders.json'));


const weekdays = {
  "Понедельник": 1,
  "Вторник": 2,
  "Среда": 3,
  "Четверг": 4,
  "Пятница": 5,
  "Суббота": 6,
  "Воскресенье": 0
};


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите действие:', reminderKeys);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
   if (creationSessions[chatId]) {
        const session = creationSessions[chatId];
        session.handleAnswer(text);

        if (session.isFinished()) {
            reminders.push(session.getReminder());
            fs.writeFileSync('reminders.json', JSON.stringify(reminders));
            bot.sendMessage(msg.chat.id, '🔔 <b>Напоминание успешно добавлено!</b> 🔔', {parse_mode:"HTML"});
            delete creationSessions[chatId];
            bot.sendMessage(msg.chat.id, 'Выберите действие:', reminderKeys);
        } else {
            session.askQuestion(bot, chatId);
        }

    } else {
      switch(text) {
        case 'Создать напоминание':
            creationSessions[chatId] = new ReminderCreation();
            creationSessions[chatId].askQuestion(bot, chatId);
          break;
        case 'Список напоминаний':
           reminders = JSON.parse(fs.readFileSync('reminders.json'));
           ReminderList.list(bot, chatId, reminders);
           bot.sendMessage(msg.chat.id, 'Выберите действие:', reminderKeys);
          break;
        case 'Время сервера':
             let now = new Date();
             let formattedTime = formatTime(now.getHours(), now.getMinutes());
             let formattedDate = formatDate(now.getDate(), now.getMonth()+1, now.getFullYear());
             bot.sendMessage(msg.chat.id, `Время сервера: ${formattedTime} ${formattedDate}`);
          break;
        case 'Удалить напоминание':
         reminders = JSON.parse(fs.readFileSync('reminders.json'));
            deletionSessions[chatId] = new ReminderDeletion();
            if (!deletionSessions[chatId].listReminders(bot, chatId, reminders)) {
              delete deletionSessions[chatId];
               bot.sendMessage(msg.chat.id, 'Выберите действие:', reminderKeys);
            }
            break;
      }
  }
});

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = msg.chat.id;

    // If the user is in the process of deleting a reminder
    if (deletionSessions[chatId]) {
        const session = deletionSessions[chatId];
        if (data === 'yes' || data === 'no') {
            const reminderToDelete = session.handleAnswer(data);
            if (reminderToDelete) {
                reminders = reminders.filter(reminder => reminder !== reminderToDelete);
                fs.writeFileSync('reminders.json', JSON.stringify(reminders));
                bot.sendMessage(chatId, 'Напоминание успешно удалено.');
            } else {
                bot.sendMessage(chatId, 'Действие отменено.');
            }
            delete deletionSessions[chatId];
        } else {
            session.confirmDeletion(bot, chatId, reminders[Number(data)]);
        }
    } else {
        switch(data) {
            case 'delete':
                deletionSessions[chatId] = new ReminderDeletion();
                if (!deletionSessions[chatId].listReminders(bot, chatId, reminders)) {
                    delete deletionSessions[chatId];
                }
                break;
        }
    }
});


const checkAndSendReminder = (reminder) => {
  let now = new Date();
  let dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  reminders = JSON.parse(fs.readFileSync('reminders.json'));

  let currentDay = dayNames[now.getDay()];
  let currentTime = formatTime(now.getHours(), now.getMinutes());

  if (reminder.isRegular) {
    if (reminder.dayOrDate === currentDay && reminder.time === currentTime) {
      bot.sendMessage(reminder.chatId, `🔔 Напоминание: ${reminder.text}`);
    }
  } else {
    let reminderDate = new Date(reminder.dayOrDate.split('.').reverse().join('-') + 'T' + reminder.time + ':00');

    if (reminderDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10) && reminder.time === currentTime) {
      bot.sendMessage(reminder.chatId, `🔔 Напоминание: ${reminder.text}`);
      // remove reminder from the list and write the changes to the file
      reminders = reminders.filter((item) => item !== reminder);
      fs.writeFileSync('reminders.json', JSON.stringify(reminders));
    } else {
      // checking for notifications 24 hours, 1 hour, and 10 minutes before the reminder
      if (reminder.notify24h && (now.getTime() - reminderDate.getTime()) === 24*60*60*1000) {
        bot.sendMessage(reminder.chatId, `🛎️ Напоминание: '${reminder.text}' будет через 24 часа.`);
      } else if (reminder.notify1h && (now.getTime() - reminderDate.getTime()) === 60*60*1000) {
        bot.sendMessage(reminder.chatId, `🛎️ Напоминание: '${reminder.text}' будет через 1 час.`);
      } else if (reminder.notify10m && (now.getTime() - reminderDate.getTime()) === 10*60*1000) {
        bot.sendMessage(reminder.chatId, `🛎️ Напоминание: '${reminder.text}' будет через 10 минут.`);
      }
    }
  }
}

const formatTime = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const formatDate = (day, month, year) => {
  return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
}

// check and send reminders every minute
cron.schedule('* * * * *', () => {
  reminders.forEach(checkAndSendReminder);
});
