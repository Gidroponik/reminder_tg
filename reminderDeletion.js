class ReminderDeletion {
    constructor() {
        this.state = 0;
        this.reminderToDelete = null;
    }

    listReminders(bot, chatId, reminders) {
        if (reminders.length === 0) {
            bot.sendMessage(chatId, 'У вас пока нет напоминаний.');
            return false;
        }

        let keyboard = reminders.map((reminder, index) => 
            [{ text: `❌ ${reminder.dayOrDate ? reminder.dayOrDate + ', ' : ''}${reminder.time}, ${reminder.text}`, callback_data: String(index) }]
        );
        keyboard.push([{ text: 'Отмена', callback_data: 'cancel' }]);

        bot.sendMessage(chatId, 'Выберите напоминание для удаления:', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        return true;
    }

    confirmDeletion(bot, chatId, reminder) {
        this.reminderToDelete = reminder;
        bot.sendMessage(chatId, `Вы точно хотите удалить напоминание ${reminder.dayOrDate ? reminder.dayOrDate + ', ' : ''}${reminder.time}, ${reminder.text}?`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Да', callback_data: 'yes' }],
                    [{ text: 'Нет', callback_data: 'no' }]
                ]
            }
        });
    }

    handleAnswer(answer) {
        if (answer === 'yes') {
            return this.reminderToDelete;
        } else {
            this.state = 0;
            this.reminderToDelete = null;
        }
        return null;
    }
}

module.exports = ReminderDeletion;
