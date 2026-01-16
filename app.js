let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
let currentQuiz = null;
let qIndex = 0;
let correctAnswers = 0;

function addQuestion() {
  const container = document.getElementById("questions");

  const div = document.createElement("div");
  div.className = "card question-card"; 

  div.innerHTML = `
    <input class="qtext" placeholder="Question text" />

    <input placeholder="Option A" />
    <input placeholder="Option B" />
    <input placeholder="Option C" />
    <input placeholder="Option D" />

    <input placeholder="Correct option (A, B, C, D)" />
  `;

  container.appendChild(div);
}


function saveQuiz() {
  const title = document.getElementById("quizTitle").value.trim();
  const desc = document.getElementById("quizDesc").value.trim();
  const topic = document.getElementById("quizTopic").value;

  if (!title || !topic) {
    alert("Please enter quiz title and topic");
    return;
  }

  const questionCards = document.querySelectorAll(".question-card");
  const questions = [];

  questionCards.forEach(card => {
    const inputs = card.querySelectorAll("input");

    if (inputs.length < 6) return;

    const questionText = inputs[0].value.trim();
    if (!questionText) return;

    const options = [
      inputs[1].value,
      inputs[2].value,
      inputs[3].value,
      inputs[4].value
    ];

    const correct = inputs[5].value.trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(correct)) {
      alert("Correct option must be A, B, C, or D");
      return;
    }

    questions.push({
      q: questionText,
      options,
      correct
    });
  });

  if (questions.length === 0) {
    alert("Add at least one valid question");
    return;
  }

  const quiz = {
    id: Date.now(),
    title,
    desc,
    topic,
    qs: questions
  };

  quizzes.push(quiz);
  localStorage.setItem("quizzes", JSON.stringify(quizzes));

  window.location.href = "browse.html";
}

function loadQuizzes(filtered = quizzes) {
  const list = document.getElementById("quizList");
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = "<p>No quizzes found.</p>";
    return;
  }

  list.innerHTML = filtered.map(q => `
    <div class="quiz-card">
      <h3>${q.title}</h3>
      <small>${q.topic}</small>
      <p>${q.desc || ""}</p>

      <div style="display:flex; gap:12px; margin-top:12px;">
        <button class="btn primary" onclick="startQuiz(${q.id})">
          Start Quiz
        </button>

        <button class="btn outline"
          style="color:red;border-color:red"
          onclick="deleteQuiz(${q.id})">
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function filterByTopic(topic) {
  if (topic === "all") {
    loadQuizzes(quizzes);
  } else {
    const filtered = quizzes.filter(q => q.topic === topic);
    loadQuizzes(filtered);
  }
}

function startQuiz(quizId) {
  localStorage.setItem("currentQuizId", quizId);
  window.location.href = "quiz.html";
}

function loadQuiz() {
  const quizId = Number(localStorage.getItem("currentQuizId"));
  currentQuiz = quizzes.find(q => q.id === quizId);

  if (!currentQuiz) {
    alert("Quiz not found");
    window.location.href = "browse.html";
    return;
  }

  document.getElementById("quizTitle").innerText = currentQuiz.title;

  qIndex = 0;
  correctAnswers = 0;

  showQuestion();
}

function showQuestion() {
  const box = document.getElementById("questionBox");
  const q = currentQuiz.qs[qIndex];

  box.innerHTML = `
    <h3>${q.q}</h3>
    ${q.options.map((opt, i) => `
      <label>
        <input type="radio" name="opt" value="${String.fromCharCode(65 + i)}">
        ${opt}
      </label><br>
    `).join("")}
  `;
}

function nextQuestion() {
  const selected = document.querySelector("input[name='opt']:checked");

  if (selected) {
    if (selected.value === currentQuiz.qs[qIndex].correct) {
      correctAnswers++;
    }
  }

  qIndex++;

  if (qIndex < currentQuiz.qs.length) {
    showQuestion();
  } else {
    localStorage.setItem("quizResult", JSON.stringify({
      title: currentQuiz.title,
      score: correctAnswers,
      total: currentQuiz.qs.length
    }));

    window.location.href = "result.html";
  }
}

function showResult() {
  const result = JSON.parse(localStorage.getItem("quizResult"));

  if (!result) {
    document.getElementById("resultScore").innerText = "No result available";
    return;
  }

  document.getElementById("resultTitle").innerText =
    `Quiz Completed: ${result.title}`;

  document.getElementById("resultScore").innerText =
    `You scored ${result.score} out of ${result.total}`;
}

function deleteQuiz(id) {
  if (!confirm("Are you sure you want to delete this quiz?")) return;

  quizzes = quizzes.filter(q => q.id !== id);
  localStorage.setItem("quizzes", JSON.stringify(quizzes));
  loadQuizzes();
}
