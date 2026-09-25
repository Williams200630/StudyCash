// ========================================
// STUDYCASH
// Основная логика приложения
// ========================================

const SUPABASE_URL = "https://hftlrygmnrmofnmkvhjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_Co87zTDbT4HQ5NndAh1gCw_0pGM0bW-";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase подключён");
// Стоимость одного часа
const HOURLY_RATE = 500;
async function saveWorkToSupabase(work) {

    // Ищем студента
    let { data: students, error: studentError } =
        await db
            .from("students")
            .select("id, name")
            .eq("name", work.student)
            .limit(1);

    if (studentError) {
        throw studentError;
    }

    let studentId;

    // Если студент уже существует
    if (students && students.length > 0) {

        studentId = students[0].id;

    } else {

        // Если студента ещё нет — создаём
        const { data: newStudent, error: insertStudentError } =
            await db
                .from("students")
                .insert({
                    name: work.student
                })
                .select()
                .single();

        if (insertStudentError) {
            throw insertStudentError;
        }

        studentId = newStudent.id;
    }


    // Создаём работу
    const { data: newWork, error: workError } =
        await db
            .from("works")
            .insert({
                student_id: studentId,
                subject: work.subject,
                work_type: work.workType,
                work_number: work.workNumber,
                hours: work.hours,
                minutes: work.minutes,
                total_minutes: work.totalMinutes,
                price: work.price
            })
            .select()
            .single();

    if (workError) {
        throw workError;
    }

    return newWork;
}


// ========================================
// Получение данных
// ========================================

function getWorks() {

    const works = localStorage.getItem("studyCashWorks");

    if (works) {
        return JSON.parse(works);
    }

    return [];
}


// ========================================
// Сохранение данных
// ========================================

function saveWorks(works) {

    localStorage.setItem(
        "studyCashWorks",
        JSON.stringify(works)
    );
}
/* ============================= */
/* ПЛАТЕЖИ */
/* ============================= */

function getPayments() {

    const payments =
        localStorage.getItem("studyCashPayments");

    if (payments) {
        return JSON.parse(payments);
    }

    return [];
}


function savePayments(payments) {

    localStorage.setItem(
        "studyCashPayments",
        JSON.stringify(payments)
    );

}


// ========================================
// Расчёт стоимости
// ========================================

function calculatePrice(hours, minutes) {

    const totalMinutes =
        (hours * 60) + minutes;

    const price =
        totalMinutes * HOURLY_RATE / 60;

    return price;
}


// ========================================
// Форматирование денег
// ========================================

function formatMoney(value) {

    return value.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " ₽";
}


// ========================================
// ФОРМА ДОБАВЛЕНИЯ РАБОТЫ
// ========================================

const workForm =
    document.getElementById("work-form");


if (workForm) {

    const hoursInput =
        document.getElementById("hours");

    const minutesInput =
        document.getElementById("minutes");

    const calculatedTime =
        document.getElementById("calculated-time");

    const calculatedPrice =
        document.getElementById("calculated-price");


    // ------------------------------------
    // Пересчёт стоимости
    // ------------------------------------

    function updateCalculation() {

        let hours =
            Number(hoursInput.value) || 0;

        let minutes =
            Number(minutesInput.value) || 0;


        // Если введено больше 59 минут,
        // переводим лишние минуты в часы

        if (minutes >= 60) {

            hours += Math.floor(minutes / 60);

            minutes = minutes % 60;

            hoursInput.value = hours;
            minutesInput.value = minutes;
        }


        const price =
            calculatePrice(hours, minutes);


        calculatedTime.textContent =
            `${hours} ч ${minutes} мин`;


        calculatedPrice.textContent =
            formatMoney(price);
    }


    // Пересчитываем при изменении времени

    hoursInput.addEventListener(
        "input",
        updateCalculation
    );

    minutesInput.addEventListener(
        "input",
        updateCalculation
    );


    // ------------------------------------
    // Добавление работы
    // ------------------------------------

    workForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const student =
                document.getElementById("student")
                    .value
                    .trim();


            const subject =
                document.getElementById("subject")
                    .value;


            const workType =
                document.getElementById("work-type")
                    .value;


            const workNumber =
                Number(
                    document.getElementById("work-number")
                        .value
                );


            const hours =
                Number(hoursInput.value) || 0;


            const minutes =
                Number(minutesInput.value) || 0;


            const totalMinutes =
                (hours * 60) + minutes;


            // Проверяем, что время указано

            if (totalMinutes <= 0) {

                alert(
                    "Укажи потраченное время."
                );

                return;
            }


            // Считаем стоимость

            const price =
                calculatePrice(hours, minutes);


            // Создаём новую работу

            const newWork = {

                id: Date.now(),

                student: student,

                subject: subject,

                workType: workType,

                workNumber: workNumber,

                hours: hours,

                minutes: minutes,

                totalMinutes: totalMinutes,

                price: price,

                paid: 0,

                date: new Date().toISOString()

            };


            try {

                // Сохраняем работу в Supabase

                await saveWorkToSupabase(newWork);


                // Пока также сохраняем в localStorage,
                // чтобы существующие страницы продолжали работать

                const works = getWorks();

                works.push(newWork);

                saveWorks(works);


                alert(
                    `Работа добавлена!\n\n` +
                    `${student}\n` +
                    `${subject}\n` +
                    `${workType} №${workNumber}\n\n` +
                    `Время: ${hours} ч ${minutes} мин\n` +
                    `Стоимость: ${formatMoney(price)}`
                );


                window.location.href = "index.html";


            } catch (error) {

                console.error(
                    "Ошибка сохранения работы в Supabase:",
                    error
                );

                alert(
                    "Не удалось сохранить работу в Supabase.\n\n" +
                    "Открой консоль браузера (F12) и посмотри ошибку."
                );

            }


            // Сообщение

            alert(
                `Работа добавлена!\n\n` +
                `${student}\n` +
                `${subject}\n` +
                `${workType} №${workNumber}\n\n` +
                `Время: ${hours} ч ${minutes} мин\n` +
                `Стоимость: ${formatMoney(price)}`
            );


            // Возвращаемся на главную

            window.location.href =
                "index.html";
        }
    );


    // Первоначальный расчёт

    updateCalculation();
}
// ========================================
// СТАТИСТИКА ГЛАВНОЙ СТРАНИЦЫ
// ========================================

function updateDashboard() {

    const works = getWorks();

    // Если мы не на главной странице,
    // ничего не делаем
    if (!document.getElementById("students-count")) {
        return;
    }


    // ------------------------------------
    // Количество студентов
    // ------------------------------------

    const students = [];

    works.forEach(function(work) {

        if (!students.includes(work.student)) {
            students.push(work.student);
        }

    });


    // ------------------------------------
    // Количество работ
    // ------------------------------------

    const worksCount = works.length;


    // ------------------------------------
    // Общее время
    // ------------------------------------

    let totalMinutes = 0;

    works.forEach(function(work) {

        totalMinutes += work.totalMinutes;

    });


    const totalHours =
        Math.floor(totalMinutes / 60);

    const remainingMinutes =
        totalMinutes % 60;


    // ------------------------------------
    // Общая сумма
    // ------------------------------------

    let totalMoney = 0;

    works.forEach(function(work) {

        totalMoney += work.price;

    });


    // ------------------------------------
    // Сколько получено
    // ------------------------------------

    const payments = getPayments();

    let paidMoney = 0;

    payments.forEach(function(payment) {
        paidMoney += payment.amount;
    });


    // ------------------------------------
    // Сколько должны
    // ------------------------------------

    const debtMoney =
        totalMoney - paidMoney;


    // ------------------------------------
    // Выводим данные
    // ------------------------------------

    document.getElementById(
        "students-count"
    ).textContent = students.length;


    document.getElementById(
        "works-count"
    ).textContent = worksCount;


    document.getElementById(
        "total-time"
    ).textContent =
        `${totalHours} ч ${remainingMinutes} мин`;


    document.getElementById(
        "total-money"
    ).textContent =
        formatMoney(totalMoney);


    document.getElementById(
        "paid-money"
    ).textContent =
        formatMoney(paidMoney);


    document.getElementById(
        "debt-money"
    ).textContent =
        formatMoney(debtMoney);
}


// Запускаем статистику

updateDashboard();
// ========================================
// СТРАНИЦА СТУДЕНТОВ
// ========================================

const studentsList =
    document.getElementById("students-list");


if (studentsList) {

    async function renderStudents(searchText = "") {

        // Показываем загрузку

        studentsList.innerHTML = `
            <div class="no-students">
                <h3>Загрузка...</h3>
                <p>Получаем данные из базы.</p>
            </div>
        `;


        // Получаем студентов

        const { data: students, error: studentsError } =
            await db
                .from("students")
                .select("*")
                .order("name");


        // Проверяем ошибку

        if (studentsError) {

            console.error(
                "Ошибка загрузки студентов:",
                studentsError
            );

            studentsList.innerHTML = `
                <div class="no-students">
                    <h3>Не удалось загрузить студентов</h3>
                    <p>
                        Проверь подключение к Supabase.
                    </p>
                </div>
            `;

            return;
        }


        // Получаем все работы

        const { data: works, error: worksError } =
            await db
                .from("works")
                .select("*");


        // Проверяем ошибку

        if (worksError) {

            console.error(
                "Ошибка загрузки работ:",
                worksError
            );

            studentsList.innerHTML = `
                <div class="no-students">
                    <h3>Не удалось загрузить работы</h3>
                    <p>
                        Проверь подключение к Supabase.
                    </p>
                </div>
            `;

            return;
        }


        // Фильтр поиска

        const filteredStudents =
            students.filter(function(student) {

                return student.name
                    .toLowerCase()
                    .includes(
                        searchText.toLowerCase()
                    );

            });


        // Если студентов нет

        if (filteredStudents.length === 0) {

            studentsList.innerHTML = `

                <div class="no-students">

                    <h3>Студентов пока нет</h3>

                    <p>
                        Добавь первую работу,
                        чтобы здесь появился студент.
                    </p>

                </div>

            `;

            return;
        }


        // Очищаем список

        studentsList.innerHTML = "";


        // Создаём карточки

        filteredStudents.forEach(
            function(student) {

                // Работы этого студента

                const studentWorks =
                    works.filter(function(work) {

                        return work.student_id === student.id;

                    });


                // Общее время

                let totalMinutes = 0;

                studentWorks.forEach(
                    function(work) {

                        totalMinutes +=
                            work.total_minutes || 0;

                    }
                );


                const hours =
                    Math.floor(
                        totalMinutes / 60
                    );


                const minutes =
                    totalMinutes % 60;


                // Начислено

                let totalMoney = 0;

                studentWorks.forEach(
                    function(work) {

                        totalMoney +=
                            Number(work.price) || 0;

                    }
                );


                // Пока оплаты берём из localStorage.
                // Полностью перенесём их на Supabase
                // на следующем этапе.

                let paidMoney = 0;

                const localPayments =
                    getPayments().filter(
                        payment =>
                            payment.student ===
                            student.name
                    );


                localPayments.forEach(
                    function(payment) {

                        paidMoney +=
                            Number(payment.amount) || 0;

                    }
                );


                // Долг

                const debt =
                    totalMoney - paidMoney;


                // Создаём карточку

                const card =
                    document.createElement("div");


                card.className =
                    "student-card";


                card.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            `student.html?name=${encodeURIComponent(student.name)}`;

                    }
                );


                card.innerHTML = `

                    <div class="student-card-header">

                        <div class="student-avatar">
                            👤
                        </div>

                        <div>

                            <div class="student-name">
                                ${student.name}
                            </div>

                        </div>

                    </div>


                    <div class="student-info">

                        <div class="student-info-item">

                            <span>
                                Работ
                            </span>

                            <strong>
                                ${studentWorks.length}
                            </strong>

                        </div>


                        <div class="student-info-item">

                            <span>
                                Общее время
                            </span>

                            <strong>
                                ${hours} ч ${minutes} мин
                            </strong>

                        </div>


                        <div class="student-info-item">

                            <span>
                                Начислено
                            </span>

                            <strong>
                                ${formatMoney(totalMoney)}
                            </strong>

                        </div>


                        <div class="student-info-item">

                            <span>
                                Оплачено
                            </span>

                            <strong>
                                ${formatMoney(paidMoney)}
                            </strong>

                        </div>

                    </div>


                    <div class="student-debt">

                        <span>
                            Осталось получить
                        </span>

                        <strong>
                            ${formatMoney(debt)}
                        </strong>

                    </div>

                `;


                studentsList.appendChild(card);

            }
        );

    }


    // Первый запуск

    renderStudents();


    // Поиск

    const searchInput =
        document.getElementById(
            "student-search"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function() {

                renderStudents(
                    searchInput.value
                );

            }
        );

    }

}
/* ============================= */
/* СТРАНИЦА КОНКРЕТНОГО СТУДЕНТА */
/* ============================= */

const studentWorksList =
    document.getElementById("student-works-list");


if (studentWorksList) {

    async function renderStudentPage() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const studentName =
            params.get("name");


        // Если имя не указано

        if (!studentName) {

            document.getElementById(
                "student-title"
            ).textContent =
                "Студент не найден";


            document.getElementById(
                "student-subtitle"
            ).textContent =
                "Не указано имя студента.";


            studentWorksList.innerHTML =
                '<div class="no-works">Студент не найден.</div>';

            return;
        }


        // ========================================
        // ИЩЕМ СТУДЕНТА В SUPABASE
        // ========================================

        const { data: students, error: studentError } =
            await db
                .from("students")
                .select("*")
                .eq("name", studentName)
                .limit(1);


        if (studentError) {

            console.error(
                "Ошибка загрузки студента:",
                studentError
            );

            studentWorksList.innerHTML = `
                <div class="no-works">
                    Не удалось загрузить данные студента.
                </div>
            `;

            return;
        }


        if (!students || students.length === 0) {

            document.getElementById(
                "student-title"
            ).textContent =
                "Студент не найден";


            document.getElementById(
                "student-subtitle"
            ).textContent =
                "Такого студента нет в базе данных.";


            studentWorksList.innerHTML =
                '<div class="no-works">Студент не найден.</div>';

            return;
        }


        const student =
            students[0];


        // ========================================
        // ЗАГРУЖАЕМ РАБОТЫ СТУДЕНТА
        // ========================================

        const { data: works, error: worksError } =
            await db
                .from("works")
                .select("*")
                .eq("student_id", student.id)
                .order("created_at", {
                    ascending: false
                });


        if (worksError) {

            console.error(
                "Ошибка загрузки работ:",
                worksError
            );

            studentWorksList.innerHTML = `
                <div class="no-works">
                    Не удалось загрузить работы студента.
                </div>
            `;

            return;
        }


        // ========================================
        // ИМЯ СТУДЕНТА
        // ========================================

        document.getElementById(
            "student-title"
        ).textContent =
            student.name;


        document.getElementById(
            "student-subtitle"
        ).textContent =
            "Информация о выполненных работах и оплате";


        // ========================================
        // КОЛИЧЕСТВО РАБОТ
        // ========================================

        document.getElementById(
            "student-works-count"
        ).textContent =
            works.length;


        // ========================================
        // ОБЩЕЕ ВРЕМЯ
        // ========================================

        let totalMinutes = 0;


        works.forEach(function(work) {

            totalMinutes +=
                Number(work.total_minutes) || 0;

        });


        const totalHours =
            Math.floor(
                totalMinutes / 60
            );


        const remainingMinutes =
            totalMinutes % 60;


        document.getElementById(
            "student-total-time"
        ).textContent =
            `${totalHours} ч ${remainingMinutes} мин`;


        // ========================================
        // ОБЩАЯ СУММА
        // ========================================

        let totalMoney = 0;


        works.forEach(function(work) {

            totalMoney +=
                Number(work.price) || 0;

        });


        document.getElementById(
            "student-total-money"
        ).textContent =
            formatMoney(totalMoney);


        // ========================================
        // ОПЛАЧЕНО
        // ========================================
        // Пока платежи берём из localStorage.
        // На следующем этапе перенесём их
        // полностью в Supabase.

        let paidMoney = 0;


        const localPayments =
            getPayments().filter(
                payment =>
                    payment.student === student.name
            );


        localPayments.forEach(function(payment) {

            paidMoney +=
                Number(payment.amount) || 0;

        });


        document.getElementById(
            "student-paid-money"
        ).textContent =
            formatMoney(paidMoney);


        // ========================================
        // ДОЛГ
        // ========================================

        const debtMoney =
            totalMoney - paidMoney;


        document.getElementById(
            "student-debt-money"
        ).textContent =
            formatMoney(debtMoney);


        // ========================================
        // СПИСОК РАБОТ
        // ========================================

        studentWorksList.innerHTML = "";


        if (works.length === 0) {

            studentWorksList.innerHTML = `
                <div class="no-works">
                    У этого студента пока нет выполненных работ.
                </div>
            `;

            return;
        }


        // ========================================
        // СОЗДАЁМ КАРТОЧКИ РАБОТ
        // ========================================

        works.forEach(function(work) {

            const workItem =
                document.createElement("div");


            workItem.className =
                "work-item";


            // ------------------------------------
            // Левая часть
            // ------------------------------------

            const main =
                document.createElement("div");


            main.className =
                "work-item-main";


            const title =
                document.createElement("h3");


            title.className =
                "work-item-title";


            title.textContent =
                `${work.work_type} №${work.work_number}`;


            const details =
                document.createElement("div");


            details.className =
                "work-item-details";


            const subject =
                document.createElement("span");


            subject.textContent =
                `📚 ${work.subject}`;


            const time =
                document.createElement("span");


            time.textContent =
                `⏱ ${work.hours} ч ${work.minutes} мин`;


            details.appendChild(subject);

            details.appendChild(time);


            main.appendChild(title);

            main.appendChild(details);


            // ------------------------------------
            // Правая часть
            // ------------------------------------

            const priceBlock =
                document.createElement("div");


            priceBlock.className =
                "work-item-price";


            const price =
                document.createElement("strong");


            price.textContent =
                formatMoney(
                    Number(work.price) || 0
                );


            priceBlock.appendChild(price);


            workItem.appendChild(main);

            workItem.appendChild(priceBlock);


            studentWorksList.appendChild(
                workItem
            );

        });

    }


    // ========================================
    // ЗАПУСК
    // ========================================

    renderStudentPage();

}
/* ============================= */
/* ИСТОРИЯ */
/* ============================= */

const historyList =
    document.getElementById("history-list");


if (historyList) {

    let currentHistoryFilter = "all";


    function formatDate(dateString) {

        const date =
            new Date(dateString);


        return date.toLocaleDateString(
            "ru-RU",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    function renderHistory() {

        const works =
            getWorks();


        const payments =
            getPayments();


        const searchInput =
            document.getElementById("history-search");


        const searchText =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        let historyItems = [];


        /* Добавляем работы */

        if (
            currentHistoryFilter === "all" ||
            currentHistoryFilter === "works"
        ) {

            works.forEach(work => {

                historyItems.push({

                    type: "work",

                    date: work.date,

                    student: work.student,

                    title:
                        `${work.workType} №${work.workNumber}`,

                    description:
                        `${work.subject} • ${work.hours} ч ${work.minutes} мин`,

                    amount: work.price

                });

            });

        }


        /* Добавляем оплаты */

        if (
            currentHistoryFilter === "all" ||
            currentHistoryFilter === "payments"
        ) {

            payments.forEach(payment => {

                historyItems.push({

                    type: "payment",

                    date: payment.date,

                    student: payment.student,

                    title: "Получена оплата",

                    description:
                        "Оплата от студента",

                    amount: payment.amount

                });

            });

        }


        /* Поиск */

        if (searchText) {

            historyItems =
                historyItems.filter(item =>
                    item.student
                        .toLowerCase()
                        .includes(searchText)
                );

        }


        /* Сортировка от новых к старым */

        historyItems.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        historyList.innerHTML = "";


        if (historyItems.length === 0) {

            historyList.innerHTML = `
                <div class="history-empty">
                    По заданным условиям ничего не найдено.
                </div>
            `;

            return;
        }


        historyItems.forEach(item => {

            const historyItem =
                document.createElement("div");


            historyItem.className =
                "history-item";


            if (item.type === "payment") {

                historyItem.classList.add(
                    "history-payment"
                );

            }


            /* Левая часть */

            const main =
                document.createElement("div");


            main.className =
                "history-item-main";


            const icon =
                document.createElement("div");


            icon.className =
                "history-item-icon";


            icon.textContent =
                item.type === "payment"
                    ? "💰"
                    : "📚";


            const textBlock =
                document.createElement("div");


            const title =
                document.createElement("h3");


            title.className =
                "history-item-title";


            title.textContent =
                `${item.student} — ${item.title}`;


            const description =
                document.createElement("p");


            description.className =
                "history-item-description";


            description.textContent =
                item.description;


            textBlock.appendChild(title);

            textBlock.appendChild(description);


            main.appendChild(icon);

            main.appendChild(textBlock);


            /* Правая часть */

            const right =
                document.createElement("div");


            right.className =
                "history-item-right";


            const price =
                document.createElement("span");


            price.className =
                "history-item-price";


            price.textContent =
                item.type === "payment"
                    ? `+${formatMoney(item.amount)}`
                    : formatMoney(item.amount);


            const date =
                document.createElement("span");


            date.className =
                "history-item-date";


            date.textContent =
                formatDate(item.date);


            right.appendChild(price);

            right.appendChild(date);


            historyItem.appendChild(main);

            historyItem.appendChild(right);


            historyList.appendChild(historyItem);

        });

    }


    /* Переключение фильтров */

    const filterButtons =
        document.querySelectorAll(
            ".history-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add("active");


                currentHistoryFilter =
                    this.dataset.filter;


                renderHistory();

            }
        );

    });


    /* Поиск */

    const historySearch =
        document.getElementById(
            "history-search"
        );


    if (historySearch) {

        historySearch.addEventListener(
            "input",
            renderHistory
        );

    }


    renderHistory();

}
// ========================================
// ВРЕМЕННЫЙ ЭКСПОРТ СТАРЫХ ДАННЫХ
// ========================================

function exportOldData() {

    const works =
        JSON.parse(
            localStorage.getItem("studyCashWorks") || "[]"
        );

    const payments =
        JSON.parse(
            localStorage.getItem("studyCashPayments") || "[]"
        );

    const data = {
        works: works,
        payments: payments
    };

    const text =
        JSON.stringify(data, null, 2);

    const blob =
        new Blob(
            [text],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "studycash-old-data.json";

    link.click();

    URL.revokeObjectURL(url);
}


const exportButton =
    document.createElement("button");

exportButton.textContent =
    "📦 Экспортировать старые данные";

exportButton.style.position =
    "fixed";

exportButton.style.bottom =
    "20px";

exportButton.style.right =
    "20px";

exportButton.style.zIndex =
    "9999";

exportButton.style.padding =
    "12px 18px";

exportButton.style.background =
    "#222";

exportButton.style.color =
    "white";

exportButton.style.border =
    "none";

exportButton.style.borderRadius =
    "8px";

exportButton.style.cursor =
    "pointer";

exportButton.addEventListener(
    "click",
    exportOldData
);

document.body.appendChild(
    exportButton
);
// ========================================
// ВРЕМЕННЫЙ ПЕРЕНОС СТАРЫХ ДАННЫХ
// ========================================

const oldPhoneData = {
    works: [
        {
            student: "Верниченко",
            subject: "Вычислительная математика",
            workType: "Лабораторная работа",
            workNumber: 1,
            hours: 0,
            minutes: 20,
            totalMinutes: 20,
            price: 166.66666666666666,
            date: "2026-09-25T14:01:11.709Z"
        },
        {
            student: "Верниченко",
            subject: "Компьютерные сети",
            workType: "Лабораторная работа",
            workNumber: 1,
            hours: 0,
            minutes: 15,
            totalMinutes: 15,
            price: 125,
            date: "2026-09-25T14:01:37.945Z"
        },
        {
            student: "Верниченко",
            subject: "Базы данных",
            workType: "Лабораторная работа",
            workNumber: 1,
            hours: 0,
            minutes: 40,
            totalMinutes: 40,
            price: 333.3333333333333,
            date: "2026-09-25T14:01:58.394Z"
        },
        {
            student: "Шевченко",
            subject: "Базы данных",
            workType: "Лабораторная работа",
            workNumber: 1,
            hours: 0,
            minutes: 45,
            totalMinutes: 45,
            price: 375,
            date: "2026-09-25T14:02:46.086Z"
        }
    ]
};


async function migrateOldPhoneData() {

    try {

        console.log("Начинаем перенос старых данных...");

        for (const oldWork of oldPhoneData.works) {

            // 1. Ищем студента
            const { data: students, error: studentSearchError } =
                await db
                    .from("students")
                    .select("id, name")
                    .eq("name", oldWork.student)
                    .limit(1);

            if (studentSearchError) {
                throw studentSearchError;
            }

            let studentId;

            // 2. Если студент уже есть — используем его
            if (students && students.length > 0) {

                studentId = students[0].id;

                console.log(
                    `Студент ${oldWork.student} уже существует`
                );

            } else {

                // 3. Если студента нет — создаём
                const { data: newStudent, error: studentInsertError } =
                    await db
                        .from("students")
                        .insert({
                            name: oldWork.student
                        })
                        .select()
                        .single();

                if (studentInsertError) {
                    throw studentInsertError;
                }

                studentId = newStudent.id;

                console.log(
                    `Создан студент ${oldWork.student}`
                );
            }


            // 4. Проверяем, не переносили ли уже эту работу
            const { data: existingWorks, error: existingWorksError } =
                await db
                    .from("works")
                    .select("id")
                    .eq("student_id", studentId)
                    .eq("subject", oldWork.subject)
                    .eq("work_type", oldWork.workType)
                    .eq("work_number", oldWork.workNumber)
                    .eq("created_at", oldWork.date)
                    .limit(1);

            if (existingWorksError) {
                throw existingWorksError;
            }


            // 5. Если такой работы ещё нет — добавляем
            if (!existingWorks || existingWorks.length === 0) {

                const { error: workInsertError } =
                    await db
                        .from("works")
                        .insert({
                            student_id: studentId,
                            subject: oldWork.subject,
                            work_type: oldWork.workType,
                            work_number: oldWork.workNumber,
                            hours: oldWork.hours,
                            minutes: oldWork.minutes,
                            total_minutes: oldWork.totalMinutes,
                            price: oldWork.price,
                            created_at: oldWork.date
                        });

                if (workInsertError) {
                    throw workInsertError;
                }

                console.log(
                    `Добавлена работа: ${oldWork.student} — ${oldWork.subject}`
                );

            } else {

                console.log(
                    `Работа уже существует: ${oldWork.student} — ${oldWork.subject}`
                );
            }
        }


        alert(
            "✅ Перенос завершён!\n\n" +
            "Добавлены старые данные:\n" +
            "• Верниченко — 3 работы\n" +
            "• Шевченко — 1 работа\n\n" +
            "Теперь проверь таблицы students и works в Supabase."
        );

    } catch (error) {

        console.error("Ошибка переноса:", error);

        alert(
            "❌ Ошибка при переносе данных.\n\n" +
            error.message
        );
    }
}


// Создаём временную кнопку
const migrationButton =
    document.createElement("button");

migrationButton.textContent =
    "📥 Перенести старые данные";

migrationButton.style.position =
    "fixed";

migrationButton.style.bottom =
    "70px";

migrationButton.style.right =
    "20px";

migrationButton.style.zIndex =
    "9999";

migrationButton.style.padding =
    "12px 18px";

migrationButton.style.background =
    "#1976d2";

migrationButton.style.color =
    "white";

migrationButton.style.border =
    "none";

migrationButton.style.borderRadius =
    "8px";

migrationButton.style.cursor =
    "pointer";

migrationButton.addEventListener(
    "click",
    migrateOldPhoneData
);

document.body.appendChild(
    migrationButton
);