<!--
db.users.update({
  email: 'i.burlak@javascript.ru'
}, {
  $addToSet: {
    roles: ['teacher'],
    profileTabsEnabled: ["courses"]
  },
  $set: {
    teacherEmail: 'i.burlak@javascript.ru',
    gotowebinar: {
      "access_token":"DRrhzuOALSoiw5gb3E5DHqsvAEYa",
      "expires_in":"30758399",
      "refresh_token":"4AZAXiIKTwqogsq2L8rMPrVEPWC1l2pB",
      "organizer_key":"5923420260454135045",
      "account_key":"7260052565876307205",
      "account_type":"",
      "firstName":"Ilya",
      "lastName":"Burlak",
      "email":"i.burlak@javascript.ru",
      "platform":"GLOBAL",
      "version":"2"
    }
 }
})
 - У юзера преподавателя:
   - roles: ["teacher"]
   - profileTabsEnabled: ["courses"]
   - teacherEmail: my@email.com - в отличие от email (скрытый email аккаунта) и publicEmail (публичный в профиле), этот email для коммуникации по курсам, публикуется для курсантов.
   - isTeacherFrontpage: true - для преподавателя, который давно ведёт курсы
   - gotowebinar - данные gotowebinar-организатора
 - Для получения данных gotowebinar, от имени юзера зайти на:
   - https://api.citrixonline.com/oauth/authorize?client_id=5Ven6FoiKXuDfNWYroB95v2xWYJqlFfT
   - с полученным кодом (заменить его в конце строки ниже):
     curl -X POST -H "Accept:application/json" -H "Content-Type: application/x-www-form-urlencoded" "https://api.citrixonline.com/oauth/access_token" -d 'grant_type=authorization_code&client_id=5Ven6FoiKXuDfNWYroB95v2xWYJqlFfT&code=КОД'
   - JSON-результат в свойство юзера gotowebinar
 - В коллекции courseTeacher должна быть запись о курсе, который он ведёт
 - На https://global.gotowebinar.com, go to Settings > Recording tab and select "Save recordings online (beta)".
-->

## Информация о группе и программа

Информация о группе находится в Github, в виде jade-шаблонов.

Можно использовать любое оформление, можно подключить существующие "стандартные" блоки и добавить свой текст, специфичный именно для конкретной группы.

Изменения в программе публикует @iliakan.

## Открытие записи

1. Создание группы:
    1. Зайдите на [эту страницу](/courses/teacher/group-create).
    2. Введите информацию о группе, всё проверьте, отправьте форму.
2. Настройка вебинара:
    1. Зайдите в gotowebinar. Вы увидите в списке новый вебинар, раскройте его и выберите Edit.
    2. Ниже в пункте Share your webinar > Registration Settings нажмите Edit.
    3. В пункте Approval поставьте [*] Manually Approve.
    4. В пункте Upon Registration поставьте [*] Direct registrants to your own confirmation page, и в поле ввода ниже: "https://learn.javascript.ru/course-webinar-registered".
    5. Внизу нажмите Save.
3. Рассылка по группе
    1. Когда вы откроете все группы, обратитесь к @iliakan для рассылки информации о ней.

### За 7-10 дней до курса

Нужно разослать всем участникам приветственное письмо и требования к предварительной настройке окружения,
к подготовке к курсу, учебные материалы, если есть.

Сделать это можно на странице [рассылок](/newsletter/admin/newsletter-releases), у @iliakan есть примеры писем.

### За день-два до курса

Возможно, к курсу присоединились ещё участники, нужно дослать приветственное письмо. Сделать это можно на той же странице, что и выше.

Перед досылкой можно внести в письмо изменения, если за неделю что-то изменилось.

При этом письмо получат только те, кто его до этого не получал.

### В начале курса

Первое занятие курса обычно – собрание. На нём проверяется подключение к системам, а также обсуждается:

1. Как задавать вопросы?
2. Как показывать домашнее задание.
3. Другие орг. вопросы.

Вебинар:

1. Разрешение лучше ставить 1280x..., причём делать это до старта вебинара, т.к. иначе запись глючит.

### В середине курса

Один или несколько раз по ходу курса разошлите письма участникам, спрашивайте, как у них дела, получается ли участвовать, делать домашнюю работу.

Такое внимание люди это очень ценят, а вы получите важную информацию от "молчунов", которую они бы иначе не написали.

### В конце курса

В конце курса мы отправляем письмо с пожеланиями успеха, а также общей информацией о материалах и просьбой оставить отзыв.

## Slack

Чтобы получить минималистичный интерфейс Slack, его можно запустить в Firefox, т.е. войти через браузер.

Потом в браузере:

1. Убрать навигацию расширением <https://addons.mozilla.org/ru/firefox/addon/hide-navigation-bar/> (горячая клавиша F2, , в настройках расширения можно поменять)
2. Убрать табы расширением <https://addons.mozilla.org/ru/firefox/addon/hide-tabbar/> (горячая клавиша F11, в настройках расширения можно выбрать любую)
3. Для оптимизации самого Slack поставить расширение <https://addons.mozilla.org/ru/firefox/addon/slack-hide-panes/> (горячая клавиша F4 после входа в Slack)
4. Расширение <https://addons.mozilla.org/ru/firefox/addon/stay-on-top/> добавит кнопку в верхний тулбар, чтобы окно Firefox было всегда наверну.
5. Расширение <https://addons.mozilla.org/en-US/firefox/addon/open-links-in-default-browser/> добавит открытие ссылки в хроме.

То есть, после установки этих расширений достаточно зайти в Slack и нажать горячие клавиши, чтобы получить минималистичный интерфейс.

Конечно, это важно в основном для преподавателя, участникам - не обязательно.

