console.log("StudyCash Timer: content.js запущен");


function getMoodleData() {

    const pageText =
        document.body
            ? document.body.innerText
            : "";


    // ========================================
    // СТУДЕНТ
    // ========================================

    let student = "";


    const userElements = [
        document.querySelector(".usermenu"),
        document.querySelector(".userbutton"),
        document.querySelector(".logininfo")
    ];


    for (const element of userElements) {

        if (!element) {
            continue;
        }


        const text =
            element.innerText
                .trim()
                .replace(/\s+/g, " ");


        if (text) {

            student = text;

            break;
        }
    }


    // ========================================
    // ПРЕДМЕТ
    // ========================================

    let subject = "";


    const headings =
        Array.from(
            document.querySelectorAll("h1, h2")
        );


    for (const heading of headings) {

        const text =
            heading.innerText
                .trim()
                .replace(/\s+/g, " ");


        if (
            text &&
            !/выполнение лр/i.test(text) &&
            !/состояние ответа/i.test(text)
        ) {

            subject = text;

            break;
        }
    }


    // ========================================
    // ЛАБОРАТОРНАЯ
    // ========================================

    let workType = "";
    let workNumber = null;


    const workMatch =
        pageText.match(
            /(?:ЛР|Лабораторная(?:\s+работа)?)\s*№\s*(\d+)/i
        );


    if (workMatch) {

        workType = "Лабораторная";

        workNumber =
            Number(workMatch[1]);
    }


    // ========================================
    // РЕЗУЛЬТАТ
    // ========================================

    const result = {

        student: student,

        subject: subject,

        workType: workType,

        workNumber: workNumber,

        url: window.location.href,

        title: document.title,

        detectedAt: Date.now()
    };


    console.log(
        "StudyCash Timer: данные Moodle:",
        result
    );


    return result;
}


// ========================================
// ОТВЕЧАЕМ НА ЗАПРОС ОТ POPUP
// ========================================

chrome.runtime.onMessage.addListener(
    function (
        message,
        sender,
        sendResponse
    ) {

        if (
            message &&
            message.action ===
            "getMoodleData"
        ) {

            const data =
                getMoodleData();


            chrome.storage.local.set(
                {
                    moodleData: data
                }
            );


            sendResponse(data);
        }


        return true;
    }
);