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

console.log("Начинаем проверку таблицы students...");

async function testSupabase() {
    console.log("Запрос отправлен");

    const { data, error } = await db
        .from("students")
        .select("*");

    console.log("Ответ Supabase:");
    console.log("data =", data);
    console.log("error =", error);
}

testSupabase();
// Стоимость одного часа
const HOURLY_RATE = 500;


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
        function(event) {

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


            // Получаем старые работы

            const works =
                getWorks();


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


            // Добавляем работу

            works.push(newWork);


            // Сохраняем

            saveWorks(works);


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

    const payments =
        getPayments().filter(
            payment => payment.student === studentName
        );


    let paidMoney = 0;


    payments.forEach(payment => {

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


    function renderStudents(searchText = "") {

        const works = getWorks();


        // Получаем уникальных студентов

        const studentNames = [];


        works.forEach(function(work) {

            if (!studentNames.includes(work.student)) {

                studentNames.push(work.student);

            }

        });


        // Фильтр поиска

        const filteredStudents =
            studentNames.filter(function(name) {

                return name
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
            function(studentName) {


                const studentWorks =
                    works.filter(function(work) {

                        return work.student === studentName;

                    });


                // Общее время

                let totalMinutes = 0;

                studentWorks.forEach(
                    function(work) {

                        totalMinutes +=
                            work.totalMinutes;

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

                        totalMoney += work.price;

                    }
                );


                // Оплачено

                let paidMoney = 0;

                studentWorks.forEach(
                    function(work) {

                        paidMoney +=
                            work.paid || 0;

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
                card.addEventListener("click", function () {

                    window.location.href =
                        `student.html?name=${encodeURIComponent(studentName)}`;

                });


                card.innerHTML = `

                    <div class="student-card-header">

                        <div class="student-avatar">
                            👤
                        </div>

                        <div>

                            <div class="student-name">
                                ${studentName}
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


    searchInput.addEventListener(
        "input",
        function() {

            renderStudents(
                searchInput.value
            );

        }
    );

}
/* ============================= */
/* СТРАНИЦА КОНКРЕТНОГО СТУДЕНТА */
/* ============================= */

const studentWorksList =
    document.getElementById("student-works-list");


if (studentWorksList) {

    function renderStudentPage() {

        const params =
            new URLSearchParams(window.location.search);

        const studentName =
            params.get("name");


        if (!studentName) {

            document.getElementById("student-title").textContent =
                "Студент не найден";

            document.getElementById("student-subtitle").textContent =
                "Не указано имя студента.";

            studentWorksList.innerHTML =
                '<div class="no-works">Студент не найден.</div>';

            return;
        }


        const works =
            getWorks().filter(
                work => work.student === studentName
            );


        /* Имя студента */

        document.getElementById("student-title").textContent =
            studentName;


        document.getElementById("student-subtitle").textContent =
            "Информация о выполненных работах и оплате";


        /* Количество работ */

        document.getElementById(
            "student-works-count"
        ).textContent = works.length;


        /* Общее время */

        let totalMinutes = 0;

        works.forEach(work => {

            totalMinutes += work.totalMinutes;

        });


        const totalHours =
            Math.floor(totalMinutes / 60);

        const remainingMinutes =
            totalMinutes % 60;


        document.getElementById(
            "student-total-time"
        ).textContent =
            `${totalHours} ч ${remainingMinutes} мин`;


        /* Общая сумма */

        let totalMoney = 0;

        works.forEach(work => {

            totalMoney += work.price;

        });


        /* Оплачено */

        let paidMoney = 0;

        works.forEach(work => {

            paidMoney += work.paid || 0;

        });


        /* Долг */

        const debtMoney =
            totalMoney - paidMoney;


        document.getElementById(
            "student-total-money"
        ).textContent =
            formatMoney(totalMoney);


        document.getElementById(
            "student-paid-money"
        ).textContent =
            formatMoney(paidMoney);


        document.getElementById(
            "student-debt-money"
        ).textContent =
            formatMoney(debtMoney);


        /* Список работ */

        studentWorksList.innerHTML = "";


        if (works.length === 0) {

            studentWorksList.innerHTML = `
                <div class="no-works">
                    У этого студента пока нет выполненных работ.
                </div>
            `;

            return;
        }


        works.forEach(work => {

            const workItem =
                document.createElement("div");

            workItem.className =
                "work-item";


            /* Левая часть */

            const main =
                document.createElement("div");

            main.className =
                "work-item-main";


            const title =
                document.createElement("h3");

            title.className =
                "work-item-title";


            title.textContent =
                `${work.workType} №${work.workNumber}`;


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


            /* Правая часть */

            const priceBlock =
                document.createElement("div");

            priceBlock.className =
                "work-item-price";


            const price =
                document.createElement("strong");

            price.textContent =
                formatMoney(work.price);


            const status =
                document.createElement("span");

            status.className =
                "work-item-status";


            const payButton =
                document.createElement("button");

            payButton.className =
                "pay-button";


            const paymentButton =
                document.getElementById("add-payment-button");

            const paymentInput =
                document.getElementById("payment-amount");


            if (paymentButton && paymentInput) {

                paymentButton.onclick = function () {

                    const amount =
                        Number(paymentInput.value);


                    if (!amount || amount <= 0) {

                        alert("Введите сумму оплаты.");

                        return;
                    }


                    const totalMoney =
                        works.reduce(
                            (sum, work) => sum + work.price,
                            0
                        );


                    const currentPayments =
                        getPayments()
                            .filter(
                                payment =>
                                    payment.student === studentName
                            );


                    const currentPaid =
                        currentPayments.reduce(
                            (sum, payment) =>
                                sum + payment.amount,
                            0
                        );


                    const debt =
                        totalMoney - currentPaid;


                    if (amount > debt) {

                        alert(
                            `Нельзя внести больше долга.\n\n` +
                            `Текущий долг: ${formatMoney(debt)}`
                        );

                        return;
                    }


                    const payments =
                        getPayments();


                    payments.push({

                        id: Date.now(),

                        student: studentName,

                        amount: amount,

                        date: new Date().toISOString()

                    });


                    savePayments(payments);


                    paymentInput.value = "";


                    renderStudentPage();


                    updateDashboard();


                    alert(
                        `Оплата ${formatMoney(amount)} добавлена.`
                    );

                };

            }


            priceBlock.appendChild(price);

            priceBlock.appendChild(status);

            priceBlock.appendChild(payButton);


            workItem.appendChild(main);

            workItem.appendChild(priceBlock);


            studentWorksList.appendChild(workItem);

        });

    }


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