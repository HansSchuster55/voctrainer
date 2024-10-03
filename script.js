// Variablen für die Navigation
const bookList = document.getElementById('book-list');
const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const showAnswerBtn = document.getElementById('show-answer');
const answerEl = document.getElementById('answer');
const correctBtn = document.getElementById('correct');
const incorrectBtn = document.getElementById('incorrect');
const progressEl = document.getElementById('progress');
const resultEl = document.getElementById('result');
const abortBtn = document.createElement('button');

// Abbruch-Button erstellen
abortBtn.id = 'abort';
abortBtn.classList.add('btn', 'btn-warning', 'btn-lg', 'my-2');
abortBtn.textContent = 'Abbrechen und Auswerten';
abortBtn.style.display = 'none';
quizContainer.appendChild(abortBtn);

// Definition der Bücher und Kapitel
const books = {
    "Buch 1": [
        "Kapitel 1: Einführungen",
        "Kapitel 2: Die Familie",
        "Kapitel 3: Das Zuhause",
        "Kapitel 4: Das tägliche Leben",
        "Kapitel 5: Essen und Trinken",
        "Kapitel 6: Das Gebet",
        "Kapitel 7: Studien",
        "Kapitel 8: Arbeit",
        "Kapitel 9: Einkaufen",
        "Kapitel 10: Das Wetter",
        "Kapitel 11: Menschen und Orte",
        "Kapitel 12: Hobbys",
        "Kapitel 13: Reisen",
        "Kapitel 14: Hajj und Umrah",
        "Kapitel 15: Gesundheit",
        "Kapitel 16: Feiertage"
    ],
    "Buch 2": [
        "Kapitel 1: Gesundheitswesen",
        "Kapitel 2: Freizeit",
        "Kapitel 3: Eheleben",
        "Kapitel 4: Stadtleben",
        "Kapitel 5: Lehren und Lernen",
        "Kapitel 6: Berufe",
        "Kapitel 7: Die arabische Sprache",
        "Kapitel 8: Geschenke",
        "Kapitel 9: Die Welt ist ein kleines Dorf",
        "Kapitel 10: Sauberkeit",
        "Kapitel 11: Islam",
        "Kapitel 12: Die Jugend",
        "Kapitel 13: Die islamische Welt",
        "Kapitel 14: Sicherheit",
        "Kapitel 15: Umweltverschmutzung",
        "Kapitel 16: Energie"
    ]
};

let currentBook = null;
let currentChapter = null;
let vocabList = [];
let currentIndex = 0;
let userAnswers = [];
let incorrectVocabList = []; // Speichert die falsch beantworteten Vokabeln

// Navigationsleiste aufbauen
function buildNavigation() {
    const accordion = document.getElementById('accordion');
    accordion.innerHTML = '';

    let bookIndex = 0;
    for (let book in books) {
        let card = document.createElement('div');
        card.classList.add('card');

        let cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.id = `heading${bookIndex}`;

        let h5 = document.createElement('h5');
        h5.classList.add('mb-0');

        let button = document.createElement('button');
        button.classList.add('btn', 'btn-link');
        button.setAttribute('data-toggle', 'collapse');
        button.setAttribute('data-target', `#collapse${bookIndex}`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `collapse${bookIndex}`);
        button.textContent = book;

        h5.appendChild(button);
        cardHeader.appendChild(h5);

        let collapseDiv = document.createElement('div');
        collapseDiv.id = `collapse${bookIndex}`;
        collapseDiv.classList.add('collapse');
        collapseDiv.setAttribute('aria-labelledby', `heading${bookIndex}`);
        collapseDiv.setAttribute('data-parent', '#accordion');

        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        let chapterList = document.createElement('ul');
        chapterList.classList.add('list-group');

        let chapters = books[book];
        chapters.forEach(chapter => {
            let chapterItem = document.createElement('li');
            chapterItem.classList.add('list-group-item');
            chapterItem.textContent = chapter;
            chapterItem.addEventListener('click', () => {
                startQuiz(book, chapter);
            });
            chapterList.appendChild(chapterItem);
        });

        cardBody.appendChild(chapterList);
        collapseDiv.appendChild(cardBody);

        card.appendChild(cardHeader);
        card.appendChild(collapseDiv);

        accordion.appendChild(card);

        bookIndex++;
    }
}

function startQuiz(book, chapter) {
    currentBook = book;
    currentChapter = chapter;
    userAnswers = [];
    incorrectVocabList = []; // Setzt die Liste der falschen Vokabeln zurück
    progressEl.innerHTML = '';
    quizContainer.style.display = 'block';
    resultEl.style.display = 'none';
    abortBtn.style.display = 'inline-block';

    // Buch- und Kapitelnummer mithilfe von Regex extrahieren
    let bookNumberMatch = book.match(/\d+/);
    let chapterNumberMatch = chapter.match(/Kapitel\s*(\d+)/i);
    let bookNumber = bookNumberMatch ? bookNumberMatch[0] : null;
    let chapterNumber = chapterNumberMatch ? chapterNumberMatch[1] : null;

    if (bookNumber === null || chapterNumber === null) {
        console.error('Konnte Buch- oder Kapitelnummer nicht extrahieren');
        alert('Fehler beim Lesen der Buch- oder Kapitelnummer');
        return;
    }

    // Führende Nullen hinzufügen, falls die Dateinamen führende Nullen haben
    let chapterNumberPadded = chapterNumber.padStart(2, '0');

    // Datenpfad erstellen
    let dataPath = `data/buch${bookNumber}/kapitel${chapterNumberPadded}.json`;

    // Daten laden
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler beim Laden der Datei: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            vocabList = data;
            currentIndex = 0;
            initializeProgress();
            loadQuestion();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Vokabeln:', error);
            alert(`Die Vokabeln konnten nicht geladen werden. Fehler: ${error.message}`);
        });
}

function initializeProgress() {
    progressEl.innerHTML = ''; // Fortschrittsbereich leeren
    for (let i = 0; i < vocabList.length; i++) {
        let circle = document.createElement('div');
        circle.classList.add('circle');
        circle.textContent = i + 1;
        progressEl.appendChild(circle);
    }
}

function loadQuestion() {
    if (currentIndex < vocabList.length) {
        let vocab = vocabList[currentIndex];
        questionEl.textContent = `Was ist die arabische Übersetzung für: "${vocab.deutsch}"?`;
        answerEl.style.display = 'none';
        showAnswerBtn.style.display = 'inline-block';
        correctBtn.style.display = 'none';
        incorrectBtn.style.display = 'none';
    } else {
        showResult();
    }
}

showAnswerBtn.addEventListener('click', () => {
    let vocab = vocabList[currentIndex];
    answerEl.style.display = 'block';
    showAnswerBtn.style.display = 'none';
    correctBtn.style.display = 'inline-block';
    incorrectBtn.style.display = 'inline-block';

    // Antwort anzeigen
    let arabicInfo = '';

    if (vocab.arabisch.singular) {
        arabicInfo += `<p>Singular: ${vocab.arabisch.singular}</p>`;
        if (vocab.arabisch.plural) {
            arabicInfo += `<p>Plural: ${vocab.arabisch.plural}</p>`;
        }
    } else if (vocab.arabisch.verb) {
        arabicInfo += `<p>Vergangenheit: ${vocab.arabisch.verb.Vergangenheit}</p>`;
        arabicInfo += `<p>Gegenwart: ${vocab.arabisch.verb.Gegenwart}</p>`;
        arabicInfo += `<p>Befehlsform: ${vocab.arabisch.verb.Befehlsform}</p>`;
        arabicInfo += `<p>Nominalverb: ${vocab.arabisch.verb.Nominalverb}</p>`;
        arabicInfo += `<p>Harf Jarr: ${vocab.arabisch.verb['Harf Jarr']}</p>`;
    }

    answerEl.innerHTML = arabicInfo;
});

correctBtn.addEventListener('click', () => {
    userAnswers.push(true);
    updateProgress(true);
    currentIndex++;
    loadQuestion();
});

incorrectBtn.addEventListener('click', () => {
    userAnswers.push(false);
    incorrectVocabList.push(vocabList[currentIndex]); // Falsche Vokabel speichern
    updateProgress(false);
    currentIndex++;
    loadQuestion();
});

abortBtn.addEventListener('click', () => {
    showResult();
});

function updateProgress(isCorrect) {
    let circles = document.querySelectorAll('.circle');
    let circle = circles[currentIndex];
    if (circle) {
        if (isCorrect) {
            circle.classList.add('correct');
        } else {
            circle.classList.add('incorrect');
        }
    }
}

function showResult() {
    quizContainer.style.display = 'none';
    resultEl.style.display = 'block';
    abortBtn.style.display = 'inline-block'; // Abbruch-Button bleibt sichtbar

    let correctAnswers = userAnswers.filter(ans => ans).length;
    let total = userAnswers.length;
    let percentage = Math.round((correctAnswers / total) * 100);

    resultEl.innerHTML = `
        <h2>Ergebnis</h2>
        <p>Richtig beantwortet: ${correctAnswers} von ${total}</p>
        <p>Prozentsatz: ${percentage}%</p>
        <button id="retry" class="btn btn-primary btn-lg">Falsche Vokabeln wiederholen</button>
    `;

    document.getElementById('retry').addEventListener('click', retryIncorrect);
}

function retryIncorrect() {
    if (incorrectVocabList.length === 0) {
        alert('Alle Vokabeln wurden richtig beantwortet!');
        return;
    }
    vocabList = [...incorrectVocabList]; // Nur falsch beantwortete Vokabeln verwenden
    incorrectVocabList = []; // Liste der falschen Vokabeln zurücksetzen, um nur die neuen Fehler zu sammeln
    currentIndex = 0;
    userAnswers = [];
    progressEl.innerHTML = '';
    initializeProgress();
    resultEl.style.display = 'none';
    quizContainer.style.display = 'block';
    loadQuestion();
}

// Navigation aufbauen beim Laden der Seite
buildNavigation();