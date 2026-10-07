let timerInterval = null;

let startedAt = null;
let currentStudent = "";

let moodleData = null;


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://hftlrygmnrmofnmkvhjb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Co87zTDbT4HQ5NndAh1gCw_0pGM0bW-";

const HOURLY_RATE = 500;


// ========================================
// ЭЛЕМЕНТЫ
// ========================================

const startScreen =
    document.getElementById("start-screen");

const studentScreen =
    document.getElementById("student-screen");

const timerScreen =
    document.getElementById("timer-screen");

const resultScreen =
    document.getElementById("result-screen");


const startMoodleButton =
    document.getElementById("start-moodle-button");

const manualButton =
    document.getElementById("manual-button");


const startButton =
    document.getElementById("start-button");

const backButton =
    document.getElementById("back-button");

const stopButton =
    document.getElementById("stop-button");

const newWorkButton =
    document.getElementById("new-work-button");


const studentNameInput =
    document.getElementById("student-name");


const currentStudentElement =
    document.getElementById("current-student");


const resultStudent =
    document.getElementById("result-student");

const resultTime =
    document.getElementById("result-time");

const resultMinutes =
    document.getElementById("result-minutes");


const timerElement =
    document.querySelector(".timer");


const detectedStudent =
    document.getElementById("detected-student");

const detectedSubject =
    document.getElementById("detected-subject");

const detectedWork =
    document.getElementById("detected-work");


// ========================================
// ПОКАЗ ЭКРАНА
// ========================================

function showScreen(screen) {

    if (startScreen) {
        startScreen.classList.add("hidden");
    }

    if (studentScreen) {
        studentScreen.classList.add("hidden");
    }

    if (timerScreen) {
        timerScreen.classList.add("hidden");
    }

    if (resultScreen) {
        resultScreen.classList.add("hidden");
    }

    if (screen) {
        screen.classList.remove("hidden");
    }
}


// ========================================
// ФОРМАТ ВРЕМЕНИ
// ========================================

function formatTime(totalSeconds) {

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


// ========================================
// ОБНОВЛЕНИЕ ТАЙМЕРА
// ========================================

function updateTimer() {

    if (!startedAt || !timerElement) {
        return;
    }

    const elapsedMilliseconds =
        Date.now() - startedAt;

    const elapsedSeconds =
        Math.floor(
            elapsedMilliseconds / 1000
        );

    timerElement.textContent =
        formatTime(elapsedSeconds);
}


// ========================================
// СОХРАНЕНИЕ ТАЙМЕРА
// ========================================

function saveTimerState() {

    if (
        !startedAt ||
        !currentStudent
    ) {
        return;
    }

    localStorage.setItem(
        "studyCashTimer",
        JSON.stringify({
            startedAt: startedAt,
            student: currentStudent
        })
    );
}


// ========================================
// ВОССТАНОВЛЕНИЕ ТАЙМЕРА
// ========================================

function loadTimerState() {

    const saved =
        localStorage.getItem(
            "studyCashTimer"
        );

    if (!saved) {
        return;
    }

    try {

        const data =
            JSON.parse(saved);

        if (
            data.startedAt &&
            data.student
        ) {

            startedAt =
                Number(data.startedAt);

            currentStudent =
                data.student;

            if (currentStudentElement) {

                currentStudentElement.textContent =
                    currentStudent;
            }

            showScreen(timerScreen);

            updateTimer();

            if (timerInterval) {

                clearInterval(
                    timerInterval
                );
            }

            timerInterval =
                setInterval(
                    updateTimer,
                    1000
                );
        }

    } catch (error) {

        console.error(
            "Ошибка загрузки таймера:",
            error
        );

        localStorage.removeItem(
            "studyCashTimer"
        );
    }
}


// ========================================
// СОХРАНЕНИЕ РАБОТЫ В SUPABASE
// ========================================

async function saveWorkToSupabase(
    studentFullName,
    subject,
    workType,
    workNumber,
    totalMinutes
) {
    const SUPABASE_URL =
        "https://hftlrygmnrmofnmkvhjb.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Co87zTDbT4HQ5NndAh1gCw_0pGM0bW-";

    const HOURLY_RATE = 500;

    // ==============================
    // 1. Получаем фамилию
    // ==============================

    const fullName = String(studentFullName || "")
        .trim()
        .replace(/\s+/g, " ");

    if (!fullName) {
        throw new Error("Не удалось определить ФИО студента");
    }

    // Первое слово = фамилия
    const nameParts = fullName.split(" ");

    const surname =
        nameParts[nameParts.length - 1].trim();

    if (!surname) {
        throw new Error("Не удалось определить фамилию студента");
    }

    console.log("ФИО из Moodle:", fullName);
    console.log("Фамилия для StudyCash:", surname);

    // ==============================
    // 2. Получаем всех студентов
    // ==============================

    const studentsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/students?select=id,name,archived`,
        {
            method: "GET",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!studentsResponse.ok) {
        throw new Error(
            "Не удалось получить список студентов"
        );
    }

    const students = await studentsResponse.json();

    // ==============================
    // 3. Ищем студента по фамилии
    // ==============================

    const normalizedSurname = surname
        .toLowerCase()
        .trim();

    const existingStudent = students.find(student => {
        const studentName = String(student.name || "")
            .trim()
            .toLowerCase();

        return studentName === normalizedSurname;
    });

    let studentId;

    // ==============================
    // 4. Если студент найден
    // ==============================

    if (existingStudent) {

        studentId = existingStudent.id;

        console.log(
            "Найден существующий студент:",
            existingStudent.name
        );

        // Если студент был архивирован,
        // возвращаем его в активные
        if (existingStudent.archived === true) {

            const restoreResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/students?id=eq.${existingStudent.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        archived: false
                    })
                }
            );

            if (!restoreResponse.ok) {
                throw new Error(
                    "Не удалось восстановить архивного студента"
                );
            }
        }

    } else {

        // ==============================
        // 5. Если студента нет —
        // создаём только по фамилии
        // ==============================

        console.log(
            "Студент не найден. Создаём:",
            surname
        );

        const createStudentResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/students`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    name: surname,
                    archived: false
                })
            }
        );

        if (!createStudentResponse.ok) {
            const errorText =
                await createStudentResponse.text();

            throw new Error(
                "Не удалось создать студента: " +
                errorText
            );
        }

        const newStudents =
            await createStudentResponse.json();

        if (!newStudents || !newStudents[0]) {
            throw new Error(
                "Supabase не вернул созданного студента"
            );
        }

        studentId = newStudents[0].id;
    }

    // ==============================
    // 6. Рассчитываем время
    // ==============================

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    // ==============================
    // 7. Рассчитываем стоимость
    // ==============================

    const price =
        Math.round(
            (totalMinutes * HOURLY_RATE / 60) * 100
        ) / 100;

    console.log("Время:", hours, "ч.", minutes, "мин.");
    console.log("Стоимость:", price, "₽");

    // ==============================
    // 8. Сохраняем работу
    // ==============================

    const workResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/works`,
        {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                student_id: studentId,
                subject: subject,
                work_type: workType,
                work_number: workNumber,
                hours: hours,
                minutes: minutes,
                total_minutes: totalMinutes,
                price: price
            })
        }
    );

    if (!workResponse.ok) {
        const errorText =
            await workResponse.text();

        throw new Error(
            "Не удалось сохранить работу: " +
            errorText
        );
    }

    const savedWork =
        await workResponse.json();

    console.log(
        "Работа успешно сохранена:",
        savedWork
    );

// Supabase возвращает массив,
// поэтому берём первый элемент
    const savedWorkData =
        Array.isArray(savedWork)
            ? savedWork[0]
            : savedWork;

    if (!savedWorkData) {
        throw new Error(
            "Supabase не вернул сохранённую работу"
        );
    }

    return savedWorkData;
}


// ========================================
// ПОЛУЧЕНИЕ ДАННЫХ С MOODLE
// ========================================

async function loadMoodleData() {

    if (detectedStudent) {
        detectedStudent.textContent =
            "Определение...";
    }

    if (detectedSubject) {
        detectedSubject.textContent =
            "Определение...";
    }

    if (detectedWork) {
        detectedWork.textContent =
            "Определение...";
    }

    try {

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });


        if (
            !tabs ||
            tabs.length === 0
        ) {

            throw new Error(
                "Активная вкладка не найдена"
            );
        }


        const tab =
            tabs[0];


        const results =
            await chrome.scripting.executeScript({

                target: {
                    tabId: tab.id
                },

                func: function () {

                    const bodyText =
                        document.body
                            ? document.body.innerText
                            : "";


                    /*
                     * ========================================
                     * 1. СТУДЕНТ
                     * ========================================
                     */

                    let student = "";


                    const studentSelectors = [
                        ".usermenu",
                        ".userbutton",
                        ".logininfo",
                        ".usermenu-container",
                        "#user-menu-toggle"
                    ];


                    for (
                        const selector
                        of studentSelectors
                        ) {

                        const element =
                            document.querySelector(
                                selector
                            );


                        if (!element) {
                            continue;
                        }


                        const text =
                            element.innerText
                                .trim()
                                .replace(
                                    /\s+/g,
                                    " "
                                );


                        if (
                            text &&
                            text.length < 150
                        ) {

                            student =
                                text;

                            break;
                        }
                    }


                    /*
                     * Если Moodle не дал ФИО
                     * через специальный элемент,
                     * ищем его в тексте.
                     */

                    if (!student) {

                        const studentMatch =
                            bodyText.match(
                                /(?:Войти как|Пользователь|Студент)\s*[:\-]?\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){1,2})/i
                            );


                        if (studentMatch) {

                            student =
                                studentMatch[1]
                                    .trim();
                        }
                    }


                    /*
                     * ========================================
                     * 2. ПРЕДМЕТ
                     * ========================================
                     */

                    let subject = "";


                    const headings =
                        Array.from(
                            document.querySelectorAll(
                                "h1, h2, h3, .page-header-headings"
                            )
                        );


                    for (
                        const heading
                        of headings
                        ) {

                        const text =
                            heading.innerText
                                .trim()
                                .replace(
                                    /\s+/g,
                                    " "
                                );


                        if (!text) {
                            continue;
                        }


                        if (
                            /выполнение\s+лр/i.test(
                                text
                            ) ||
                            /лабораторная\s+работа/i.test(
                                text
                            ) ||
                            /состояние\s+ответа/i.test(
                                text
                            ) ||
                            /задание/i.test(
                                text
                            )
                        ) {

                            continue;
                        }


                        if (text.length < 5) {
                            continue;
                        }


                        subject =
                            text;

                        break;
                    }


                    let workType = "";

                    let workNumber = null;


// ========================================
// ЛАБОРАТОРНЫЕ
// Поддерживаются:
// ЛР 1
// ЛР №2
// Лабораторная работа 4.2
// Лабораторная работы 4.2, 4.3
// Лабораторные работы 4.2, 4.3
// ========================================

                    const laboratoryMatch =
                        bodyText.match(
                            /(?:ЛР|Лабораторн(?:ая|ые|ой)\s+работ(?:а|ы|у)?)\s*№?\s*((?:\d+(?:\.\d+)?)(?:\s*[-–]\s*(?:\d+(?:\.\d+)?))?(?:\s*,\s*(?:\d+(?:\.\d+)?))*)/i
                        );


                    if (laboratoryMatch) {

                        workType =
                            "Лабораторная";

                        workNumber =
                            laboratoryMatch[1]
                                .replace(/\s+/g, " ")
                                .trim();

                    }


                    /*
                     * ========================================
                     * 4. РЕЗУЛЬТАТ
                     * ========================================
                     */

                    return {

                        student:
                        student,

                        subject:
                        subject,

                        workType:
                        workType,

                        workNumber:
                        workNumber,

                        title:
                        document.title,

                        url:
                        window.location.href
                    };
                }
            });


        if (
            !results ||
            results.length === 0
        ) {

            throw new Error(
                "Не удалось получить данные Moodle"
            );
        }


        const data =
            results[0].result;


        console.log(
            "StudyCash Timer: получены данные:",
            data
        );


        moodleData =
            data;


        if (detectedStudent) {

            detectedStudent.textContent =
                data.student ||
                "Не найден";
        }


        if (detectedSubject) {

            detectedSubject.textContent =
                data.subject ||
                "Не найден";
        }


        if (detectedWork) {

            if (
                data.workType &&
                data.workNumber
            ) {

                detectedWork.textContent =
                    `${data.workType} №${data.workNumber}`;

            } else {

                detectedWork.textContent =
                    "Не найдено";
            }
        }


        console.log(
            "StudyCash Timer: определение завершено"
        );

    } catch (error) {

        console.error(
            "StudyCash Timer: ошибка:",
            error
        );


        if (detectedStudent) {

            detectedStudent.textContent =
                "Ошибка";
        }


        if (detectedSubject) {

            detectedSubject.textContent =
                error.message ||
                "Неизвестная ошибка";
        }


        if (detectedWork) {

            detectedWork.textContent =
                "—";
        }
    }
}


// ========================================
// НАЧАТЬ РАБОТУ ПО MOODLE
// ========================================

if (startMoodleButton) {

    startMoodleButton.addEventListener(
        "click",
        function () {

            if (
                !moodleData ||
                !moodleData.student
            ) {

                alert(
                    "Не удалось определить студента в Moodle."
                );

                return;
            }


            if (
                !moodleData.subject
            ) {

                alert(
                    "Не удалось определить предмет в Moodle."
                );

                return;
            }


            if (
                !moodleData.workType ||
                !moodleData.workNumber
            ) {

                alert(
                    "Не удалось определить номер лабораторной."
                );

                return;
            }


            currentStudent =
                moodleData.student;


            startedAt =
                Date.now();


            if (currentStudentElement) {

                currentStudentElement.textContent =
                    currentStudent;
            }


            saveTimerState();


            showScreen(timerScreen);


            updateTimer();


            if (timerInterval) {

                clearInterval(
                    timerInterval
                );
            }


            timerInterval =
                setInterval(
                    updateTimer,
                    1000
                );
        }
    );
}


// ========================================
// РУЧНОЙ ВВОД
// ========================================

if (manualButton) {

    manualButton.addEventListener(
        "click",
        function () {

            showScreen(studentScreen);


            if (studentNameInput) {

                setTimeout(
                    function () {

                        studentNameInput.focus();

                    },
                    100
                );
            }
        }
    );
}


// ========================================
// РУЧНО НАЧАТЬ РАБОТУ
// ========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            const name =
                studentNameInput
                    ? studentNameInput.value.trim()
                    : "";


            if (!name) {

                alert(
                    "Введите фамилию студента."
                );

                if (studentNameInput) {

                    studentNameInput.focus();
                }

                return;
            }


            /*
             * При ручном режиме Moodle-данные
             * не используем.
             */

            moodleData = null;


            currentStudent =
                name;


            startedAt =
                Date.now();


            if (currentStudentElement) {

                currentStudentElement.textContent =
                    currentStudent;
            }


            saveTimerState();


            showScreen(timerScreen);


            updateTimer();


            if (timerInterval) {

                clearInterval(
                    timerInterval
                );
            }


            timerInterval =
                setInterval(
                    updateTimer,
                    1000
                );
        }
    );
}


// ========================================
// НАЗАД
// ========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            showScreen(startScreen);


            if (studentNameInput) {

                studentNameInput.value = "";
            }
        }
    );
}


// ========================================
// ОСТАНОВИТЬ ТАЙМЕР
// ========================================

if (stopButton) {

    stopButton.addEventListener(
        "click",
        async function () {

            if (!startedAt) {
                return;
            }


            /*
             * ----------------------------------------
             * Считаем фактическое время
             * ----------------------------------------
             */

            const elapsedMilliseconds =
                Date.now() - startedAt;


            const elapsedSeconds =
                Math.floor(
                    elapsedMilliseconds / 1000
                );


            const elapsedMinutes =
                Math.max(
                    1,
                    Math.ceil(
                        elapsedSeconds / 60
                    )
                );


            const formattedTime =
                formatTime(
                    elapsedSeconds
                );


            /*
             * ----------------------------------------
             * Останавливаем визуальный таймер
             * ----------------------------------------
             */

            if (timerInterval) {

                clearInterval(
                    timerInterval
                );

                timerInterval = null;
            }


            /*
             * ----------------------------------------
             * Показываем результат
             * ----------------------------------------
             */

            if (resultStudent) {

                resultStudent.textContent =
                    currentStudent;
            }


            if (resultTime) {

                resultTime.textContent =
                    formattedTime;
            }


            if (resultMinutes) {

                resultMinutes.textContent =
                    elapsedMinutes + " мин";
            }


            /*
             * ----------------------------------------
             * Сохраняем работу в Supabase
             * ----------------------------------------
             */

            let savedSuccessfully =
                false;


            if (
                moodleData &&
                moodleData.student &&
                moodleData.subject &&
                moodleData.workType &&
                moodleData.workNumber
            ) {

                try {

                    const saved =
                        await saveWorkToSupabase(

                            moodleData.student,

                            moodleData.subject,

                            moodleData.workType,

                            moodleData.workNumber,

                            elapsedMinutes
                        );


                    savedSuccessfully =
                        true;


                    const savedPrice =
                        Number(saved.price);

                    if (!Number.isFinite(savedPrice)) {
                        throw new Error(
                            "Supabase не вернул корректную стоимость работы"
                        );
                    }

                    const priceText =
                        savedPrice
                            .toFixed(2)
                            .replace(".", ",");


                    if (resultMinutes) {

                        resultMinutes.textContent =
                            `${elapsedMinutes} мин • ${priceText} ₽`;
                    }


                    console.log(
                        "StudyCash Timer: работа успешно отправлена в StudyCash"
                    );


                    alert(
                        "✓ Работа сохранена в StudyCash!\n\n" +
                        "Студент: " +
                        moodleData.student +
                        "\n" +
                        "Предмет: " +
                        moodleData.subject +
                        "\n" +
                        "Работа: " +
                        moodleData.workType +
                        " №" +
                        moodleData.workNumber +
                        "\n" +
                        "Время: " +
                        elapsedMinutes +
                        " мин\n" +
                        "Стоимость: " +
                        priceText +
                        " ₽"
                    );

                } catch (error) {

                    console.error(
                        "StudyCash Timer: ошибка сохранения:",
                        error
                    );


                    alert(
                        "⚠ Работа НЕ сохранена в StudyCash.\n\n" +
                        "Причина:\n" +
                        error.message
                    );
                }

            } else {

                console.log(
                    "StudyCash Timer: Moodle-данные отсутствуют. Работа не отправлена."
                );


                alert(
                    "Таймер остановлен.\n\n" +
                    "Данные Moodle не найдены, поэтому работа не была отправлена в StudyCash."
                );
            }


            /*
             * ----------------------------------------
             * Удаляем сохранённое состояние таймера
             * ----------------------------------------
             */

            localStorage.removeItem(
                "studyCashTimer"
            );


            startedAt =
                null;


            showScreen(resultScreen);
        }
    );
}


// ========================================
// НОВАЯ РАБОТА
// ========================================

if (newWorkButton) {

    newWorkButton.addEventListener(
        "click",
        function () {

            currentStudent = "";

            startedAt = null;


            if (studentNameInput) {

                studentNameInput.value = "";
            }


            if (timerElement) {

                timerElement.textContent =
                    "00:00:00";
            }


            showScreen(startScreen);


            loadMoodleData();
        }
    );
}


// ========================================
// ЗАПУСК
// ========================================

loadMoodleData();

loadTimerState();