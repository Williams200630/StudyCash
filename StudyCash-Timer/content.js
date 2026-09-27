console.log("StudyCash Timer: Moodle обнаружен");


// ========================================
// ПОЛУЧАЕМ ТЕКСТ СТРАНИЦЫ
// ========================================

function getPageText() {

    return document.body
        ? document.body.innerText
        : "";
}


// ========================================
// ОПРЕДЕЛЯЕМ СТУДЕНТА
// ========================================

function detectStudent() {

    // Стандартный Moodle user menu
    const userMenu =
        document.querySelector(".usermenu");

    if (userMenu) {

        const text =
            userMenu.innerText.trim();

        if (text) {
            return text
                .split("\n")
                .map(function (line) {
                    return line.trim();
                })
                .filter(Boolean)[0];
        }
    }


    // Дополнительный вариант Moodle
    const userButton =
        document.querySelector(".userbutton");

    if (userButton) {

        const text =
            userButton.innerText.trim();

        if (text) {
            return text
                .split("\n")
                .map(function (line) {
                    return line.trim();
                })
                .filter(Boolean)[0];
        }
    }


    return "";
}


// ========================================
// ОПРЕДЕЛЯЕМ ПРЕДМЕТ
// ========================================

function detectSubject() {

    /*
        На твоей странице название предмета
        находится в главном заголовке:

        Программирование робототехнических систем 1
    */

    const h1 =
        document.querySelector("h1");

    if (h1) {

        const text =
            h1.innerText.trim();

        if (text) {
            return text;
        }
    }


    return "";
}


// ========================================
// ОПРЕДЕЛЯЕМ ЛАБОРАТОРНУЮ
// ========================================

function detectWork() {

    const pageText =
        getPageText();


    /*
        Ищем конструкции:

        ЛР № 2
        ЛР №2
        Лабораторная № 2
        Лабораторная работа № 2
    */

    const patterns = [

        /ЛР\s*№\s*(\d+)/i,

        /Лабораторн(?:ая|ой|ую)\s*(?:работа)?\s*№\s*(\d+)/i,

        /Лабораторная\s+работа\s*№\s*(\d+)/i
    ];


    for (
        let i = 0;
        i < patterns.length;
        i++
    ) {

        const match =
            pageText.match(patterns[i]);

        if (match) {

            return {
                type: "Лабораторная",
                number: Number(match[1])
            };
        }
    }


    return {
        type: "",
        number: null
    };
}


// ========================================
// ПОЛУЧАЕМ ВСЮ ИНФОРМАЦИЮ
// ========================================

function detectMoodleData() {

    const student =
        detectStudent();

    const subject =
        detectSubject();

    const work =
        detectWork();


    const data = {

        student: student,

        subject: subject,

        workType: work.type,

        workNumber: work.number,

        url: window.location.href,

        detectedAt: Date.now()
    };


    console.log(
        "StudyCash Timer — найдено:",
        data
    );


    return data;
}


// ========================================
// СОХРАНЯЕМ В РАСШИРЕНИИ
// ========================================

function saveMoodleData() {

    const data =
        detectMoodleData();


    chrome.storage.local.set(
        {
            moodleData: data
        },
        function () {

            if (chrome.runtime.lastError) {

                console.error(
                    "StudyCash Timer:",
                    chrome.runtime.lastError
                );

                return;
            }


            console.log(
                "StudyCash Timer: данные сохранены"
            );
        }
    );
}


// ========================================
// ПЕРВИЧНОЕ ОПРЕДЕЛЕНИЕ
// ========================================

saveMoodleData();


// ========================================
// ЕСЛИ MOODLE ДИНАМИЧЕСКИ
// МЕНЯЕТ СТРАНИЦУ
// ========================================

let lastUrl =
    window.location.href;


setInterval(
    function () {

        if (
            window.location.href !==
            lastUrl
        ) {

            lastUrl =
                window.location.href;

            setTimeout(
                saveMoodleData,
                1000
            );
        }

    },
    1000
);