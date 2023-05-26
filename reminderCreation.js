class ReminderCreation {
    constructor() {
        this.state = 0;
        this.reminder = {
            chatId:0,
            isRegular: false,
            dayOrDate: '',
            time: '',
            text: '',
            notify24h: false,
            notify1h: false,
            notify10m: false
        };
    }

    askQuestion(bot, chatId) {
        switch (this.state) {
            case 0:
                bot.sendMessage(chatId, 'Регулярное напоминание?', {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Да' }, { text: 'Нет' }],
                        ],
                        one_time_keyboard: true,
                    }
                });
                this.reminder.chatId = chatId;
            break;
            case 1:
                if(this.reminder.isRegular){
                 bot.sendMessage(chatId, "<i>Выберите день недели, в который нужно отправлять Напоминание</i>", {
                        parse_mode: 'HTML',
                        reply_markup: {
                            keyboard: [
                                [{ text: 'Понедельник' }, { text: 'Вторник' }, { text: 'Среда' }],
                                [{ text: 'Четверг' }, { text: 'Пятница' }, { text: 'Суббота' }],
                                [{ text: 'Воскресенье' }],
                            ],
                            one_time_keyboard: true,
                        }
                    });
                }
                else bot.sendMessage(chatId, "<i>Напишите дату, когда вам нужно отправлять напоминания\r\nВ формате:</i> \r\n<b>День.Месяц.Год</b>", {parse_mode:'HTML'});
            break;
            case 2:
                bot.sendMessage(chatId, "<i>В какое время нужно отправить напоминание</i>\r\n<b>Часы:Минуты</b>", {parse_mode:'HTML'});
            break;
            case 3:
                bot.sendMessage(chatId, "<i>Текст напоминания</i>", {parse_mode:'HTML'});
            break;
            case 4:
                bot.sendMessage(chatId, '<i>Напомнить за 24 часа до даты напоминания?</i>', {
                    parse_mode:'HTML',
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Да' }, { text: 'Нет' }],
                        ],
                        one_time_keyboard: true,
                    }
                });
            break;
            case 5:
                bot.sendMessage(chatId, '<i>Напомнить за 1 час до даты напоминания?</i>', {
                    parse_mode:'HTML',
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Да' }, { text: 'Нет' }],
                        ],
                        one_time_keyboard: true,
                    }
                });
            break;
            case 6:
                bot.sendMessage(chatId, '<i>Напомнить за 10 минут до даты напоминания?</i>', {
                    parse_mode:'HTML',
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Да' }, { text: 'Нет' }],
                        ],
                        one_time_keyboard: true,
                    }
                });
            break;  

        }
        this.state++;
    }

    handleAnswer(answer) {
        switch (this.state) {
            case 1:
                this.reminder.isRegular = answer === 'Да';
            break;
            case 2:
                this.reminder.dayOrDate = answer;
            break;
            case 3:
                this.reminder.time = answer;
            break;
            case 4:
                this.reminder.text = answer;
            break;
            case 5:
                this.reminder.notify24h = answer === 'Да';
            break;
            case 6:
                this.reminder.notify1h = answer === 'Да';
            break;
            case 7:
                this.reminder.notify10m = answer === 'Да';
            break;
        }
    }

    isFinished() {
        return this.state >= 7;
    }

    getReminder() {
        return this.reminder;
    }
}

module.exports = ReminderCreation;
