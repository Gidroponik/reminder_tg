class ReminderList {
    static list(bot, chatId, reminders) {
        if (reminders.length === 0) {
            bot.sendMessage(chatId, '🔔 <i>У вас пока нет напоминаний.</i>',{parse_mode:"HTML"});
            return;
        }

        let message = '';
        reminders.forEach((reminder, index) => {
            message += `🔔 <i>Напоминание</i> 🔔\r\n⏲️ ${reminder.dayOrDate ? reminder.dayOrDate + ', ' : ''}${reminder.time}\r\n👉 <b>${reminder.text}</b>\r\n\r\n`;
        });

        bot.sendMessage(chatId, message,{parse_mode:"HTML"});
    }
}

module.exports = ReminderList;
