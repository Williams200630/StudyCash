let timerInterval = null;
let moodleData = null;

let startedAt = null;
let currentStudent = "";


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

const selfButton =
    document.getElementById("self-button");

const studentButton =
    document.getElementById("student-button");

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

const startMoodleButton =
    document.getElementById("start-moodle-button");

const manualButton =
    document.getElementById("manual-button");
// ========================================
// ЗАГРУЗКА ДАННЫХ MOODLE
// ========================================

function loadMoodleData() {

    chrome.storage.local.get(
        ["moodleData"],
        function (result) {

            moodleData =
                result.moodleData || null;


            if (!moodleData) {

                detectedStudent.textContent =
                    "Moodle не обнаружен";

                detectedSubject.textContent =
                    "—";

                detectedWork.textContent =
                    "—";

                return;
            }


            detectedStudent.textContent =
                moodleData.student || "Не найден";

            detectedSubject.textContent =
                moodleData.subject || "Не найден";


            if (
                moodleData.workType &&
                moodleData.workNumber
            ) {

                detectedWork.textContent =
                    `${moodleData.workType} №${moodleData.workNumber}`;

            } else {

                detectedWork.textContent =
                    "Не найдено";
            }
        }
    );
}


// ========================================
// ПОКАЗ ЭКРАНОВ
// ========================================

function showScreen(screen) {

    startScreen.classList.add("hidden");
    studentScreen.classList.add("hidden");
    timerScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    screen.classList.remove("hidden");
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

    if (!startedAt) {
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
// СОХРАНЕНИЕ СОСТОЯНИЯ
// ========================================

function saveTimerState() {

    if (!startedAt || !currentStudent) {
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
// ЗАГРУЗКА СОСТОЯНИЯ
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

            currentStudentElement.textContent =
                currentStudent;

            showScreen(timerScreen);

            updateTimer();

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
// ДЛЯ СЕБЯ
// ========================================

selfButton.addEventListener(
    "click",
    function () {

        alert(
            "Работа для себя не учитывается в StudyCash."
        );
    }
);


// ========================================
// ДЛЯ СТУДЕНТА
// ========================================

studentButton.addEventListener(
    "click",
    function () {

        showScreen(studentScreen);

        setTimeout(
            function () {
                studentNameInput.focus();
            },
            100
        );
    }
);


// ========================================
// НАЗАД
// ========================================

backButton.addEventListener(
    "click",
    function () {

        showScreen(startScreen);

        studentNameInput.value = "";
    }
);


// ========================================
// НАЧАТЬ РАБОТУ
// ========================================

startButton.addEventListener(
    "click",
    function () {

        const name =
            studentNameInput.value.trim();

        if (!name) {

            alert(
                "Введите фамилию студента."
            );

            studentNameInput.focus();

            return;
        }


        currentStudent = name;

        startedAt = Date.now();


        currentStudentElement.textContent =
            currentStudent;


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


// ========================================
// ЗАВЕРШИТЬ РАБОТУ
// ========================================

stopButton.addEventListener(
    "click",
    function () {

        if (!startedAt) {
            return;
        }


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
            formatTime(elapsedSeconds);


        if (timerInterval) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;
        }


        resultStudent.textContent =
            currentStudent;


        resultTime.textContent =
            formattedTime;


        resultMinutes.textContent =
            elapsedMinutes + " мин";


        localStorage.removeItem(
            "studyCashTimer"
        );


        startedAt = null;


        showScreen(resultScreen);
    }
);


// ========================================
// НОВАЯ РАБОТА
// ========================================

newWorkButton.addEventListener(
    "click",
    function () {

        currentStudent = "";

        studentNameInput.value = "";

        timerElement.textContent =
            "00:00:00";

        showScreen(startScreen);
    }
);


// ========================================
// ЗАПУСК
// ========================================
loadMoodleData();
loadTimerState();