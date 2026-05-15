let archivoFoto = null;
const flashcardsBtn = document.getElementById("flashcardsBtn");
const infographicBtn = document.getElementById("infographicBtn");
const videoBtn = document.getElementById("video-btn");
const quizBtn = document.getElementById("quizBtn");
const quizContent = document.getElementById("quizContent");

const flashcardsPanel = document.getElementById("flashcards-panel");
const infographicContent = document.getElementById("infographicContent");
const videoContent = document.getElementById("videoContent");
document.getElementById('foto-input').addEventListener('change', function(e){

  const file = e.target.files[0];
  if(!file) return;
  archivoFoto = file;
  const reader = new FileReader();
  reader.onload = function(ev){

    const img = document.getElementById('preview-img');

    img.src = ev.target.result;
    img.style.display = 'block';

    document.getElementById('upload-icon').style.display = 'none';
    document.getElementById('upload-text').style.display = 'none';
    document.getElementById('upload-sub').style.display = 'none';
    document.getElementById('upload-box').classList.add('has-image');
    document.getElementById('upload-box').classList.add('compact');
    document.getElementById('btn-procesar').style.display = 'block';
    document.getElementById('btn-reset-top').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

async function procesar(){

  if(!archivoFoto) return;

  const btn = document.getElementById('btn-procesar');

  btn.disabled = true;
  btn.textContent = 'Generando...';

  document.getElementById('estado').style.display = 'block';
  document.getElementById('progreso').style.display = 'block';
  document.getElementById('upload-state').style.display = 'none';
  document.getElementById('video-base-state').style.display = 'block';
  document.getElementById('videoContent').style.display = 'flex';
  document.getElementById('resultado-panel').style.display = 'none';
  document.getElementById('flashcards-panel').style.display = 'none';
  document.getElementById('top-tabs').style.display = 'flex';
  document.getElementById('intro-panel').style.display = 'none';
  document.getElementById('video-original').style.display = 'block';
  document.getElementById('panel-bg').src = '/static/fondo_clean.png';
  videoBtn.classList.add("active");
  flashcardsBtn.classList.remove("active");
  infographicBtn.classList.remove("active");
  quizBtn.classList.remove("active");
  const formData = new FormData();
  
  formData.append('foto', archivoFoto);

  try{
    const res = await fetch('/procesar', {
    method:'POST',
    body:formData
    });
    const data = await res.json();
    if(data.success){
      const videoUrl = `/resultado/${data.video_id}`;
      const videoEl = document.getElementById('video-resultado');
      const descarga = document.getElementById('btn-descargar');
      videoEl.src = videoUrl;
      const videoPreview = document.getElementById('video-original');
      videoPreview.src = videoUrl;
      videoPreview.pause();
      videoPreview.currentTime = 0;
      videoPreview.controls = false;
      videoPreview.muted = true;
      descarga.href = videoUrl;
      document.getElementById('estado').style.display = 'none';
      document.getElementById('progreso').style.display = 'none';      
      document.getElementById('btn-ver-video').style.display = 'block';
      videoPreview.style.filter = `
        blur(1px)
        brightness(1.1)
        saturate(0.7)
      `;
      videoPreview.style.opacity = '0.72';
      document.getElementById('mini-flashcards').style.display = 'flex';
      document.getElementById('btn-procesar').style.display = 'none';
      btn.style.display = 'none';
      btn.textContent = '✨ Generar mi video';
    }else{
      alert('Error: ' + (data.error || 'Something went wrong'));
      btn.disabled = false;
      btn.textContent = '✨ Generar mi video';
    }
  }catch(err){
    alert('Error de conexión con el servidor');
    btn.disabled = false;
    btn.textContent = '✨ Generar mi video';
  }
}

function mostrarResultado(){
  document.getElementById('video-base-state').style.display = 'none';
  document.getElementById('btn-ver-video').style.display = 'none';
  document.getElementById('flashcards-panel').style.display = 'none';
  document.getElementById('infographicContent').style.display = 'none';
  document.getElementById('videoContent').style.display = 'none';
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('top-tabs').style.display = 'none';
  document.getElementById('btn-material').style.display = 'block';
  document.getElementById('resultado-panel').style.display = 'flex';
  document.getElementById('btn-volver-flashcards').style.display = 'block';
  document.getElementById('mini-flashcards').style.display = 'flex';
  document.getElementById('result-actions').style.display = 'flex';
}
const flashcards = [
  {
    image: "/static/flashcards/card1.png"
  },
  {
    image: "/static/flashcards/card2.png"
  },
  {
    image: "/static/flashcards/card3.png"
  }
];

let flashcardIndex = -1;
const quizQuestions = [

  {
    question: "Who was the enigmatic shadow known as Agent H21?",
    options: [
      "Mata Hari",
      "Marta Hari",
      "Meta Hari"
    ],
    correct: 0
  },

  {
    question: "What was the public persona of Mata Hari during the Great War?",
    options: [
      "A glamorous Javanese princess",
      "A cunning French diplomat",
      "A secret British operative"
    ],
    correct: 0
  },

  {
    question: "What is the ongoing historical debate surrounding Mata Hari’s legacy?",
    options: [
      "Whether she was a dangerous spy or a convenient scapegoat",
      "Whether she was a brilliant military strategist",
      "Whether she was a researcher inventing communication codes"
    ],
    correct: 0
  },

  {
    question: "What surprising truth reveals the real method Mata Hari used to navigate the world?",
    options: [
      "She did not use codes or hidden messages",
      "She was known for encrypted correspondence",
      "She used secret invisible ink"
    ],
    correct: 0
  },

  {
    question: "What personal motivation drove Mata Hari to become a double agent?",
    options: [
      "To reach Vadim, the Russian pilot she loved",
      "To serve the interests of her country",
      "To gain power in the espionage world"
    ],
    correct: 0
  }

];

let currentQuiz = 0;
let score = 0;

function renderQuizQuestion(){

  const questionEl = document.getElementById("quiz-question");
  const optionsEl = document.getElementById("quiz-options");
  const scoreEl = document.getElementById("quiz-score");

  if(currentQuiz >= quizQuestions.length){

    questionEl.innerHTML = `
      🎉 You finished the quiz!
    `;

    optionsEl.innerHTML = `
      <button
        class="quiz-option"
        onclick="restartQuiz()"
      >
        Restart Quiz
      </button>
    `;

    scoreEl.innerHTML = `
      Score: ${score} / ${quizQuestions.length}
    `;

    return;
  }

  const q = quizQuestions[currentQuiz];

  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = option;
    btn.onclick = () => checkAnswer(index);
    optionsEl.appendChild(btn);
  });

  scoreEl.innerHTML = `
    Score: ${score}
  `;
}

function checkAnswer(selected){
  const q = quizQuestions[currentQuiz];
  const buttons = document.querySelectorAll(".quiz-option");
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if(index === q.correct){
      btn.style.background = "#8b5cf6";
      btn.style.color = "white";
    }else if(index === selected){
      btn.style.background = "#ef4444";
      btn.style.color = "white";
    }

  });

  if(selected === q.correct){
    score++;
  }

  setTimeout(() => {
    currentQuiz++;
    renderQuizQuestion();
  }, 1200);
}

function restartQuiz(){

  currentQuiz = 0;
  score = 0;

  renderQuizQuestion();
}

function siguienteFlashcard() {
  const front = document.getElementById('flashcard-front');
  const back  = document.getElementById('flashcard-back');

  let nextIndex = flashcardIndex + 1;
  if (nextIndex >= flashcards.length) nextIndex = 0;
 back.innerHTML = `
  <img 
    src="${flashcards[nextIndex].image}"
    class="flashcard-image"
  >
  <div
    class="flashcard-zoom"
    onclick="abrirFlashcard('${flashcards[nextIndex].image}')"
  >
    🔍
  </div>

`;

  front.classList.add('slide-out');

setTimeout(() => {
    front.style.transition = 'none';
    front.style.transform = 'scale(1) translateY(0)';  
    front.innerHTML = back.innerHTML;
    front.classList.remove('slide-out');

    requestAnimationFrame(() => {
      front.style.transition = '';
      front.style.transform = '';
    });

    flashcardIndex = nextIndex;
  }, 420);
}
function volverFlashcards(){
  document.getElementById('resultado-panel').style.display = 'none';
  document.getElementById('flashcards-panel').style.display = 'flex';
  document.getElementById('video-base-state').style.display = 'block';
  document.getElementById('btn-volver-flashcards').style.display = 'none';
  document.getElementById('btn-ver-video').style.display = 'block';
}
function volverMaterial(){

  document.getElementById('resultado-panel').style.display = 'none';
  document.getElementById('video-base-state').style.display = 'block';
  document.getElementById('top-tabs').style.display = 'flex';
  document.getElementById('videoContent').style.display = 'flex';
  document.getElementById('btn-material').style.display = 'none';
  document.getElementById('btn-ver-video').style.display = 'block';
  document.getElementById('result-actions').style.display = 'none';
  videoBtn.classList.add("active");

  flashcardsBtn.classList.remove("active");

  infographicBtn.classList.remove("active");

  quizBtn.classList.remove("active");

}
function abrirInfografia(){
  const modal = document.getElementById("image-modal");
  const modalImage = modal.querySelector(".modal-image");
  modalImage.src = "/static/images/infografia.png?v=" + new Date().getTime();
  modal.style.display = "flex";
}

function cerrarInfografia(){
  document.getElementById("image-modal").style.display = "none";

}
function abrirFlashcard(imageSrc){
  const modal = document.getElementById("image-modal");
  modal.style.display = "flex";
  document.querySelector(".modal-image").src = imageSrc;

}

function reiniciarExperiencia(){

  archivoFoto = null;

  document.getElementById('upload-state').style.display = 'block';
  document.getElementById('video-base-state').style.display = 'none';
  document.getElementById('flashcards-panel').style.display = 'none';
  document.getElementById('resultado-panel').style.display = 'none';
  document.getElementById('intro-panel').style.display = 'flex';
  document.getElementById('btn-ver-video').style.display = 'none';
  document.getElementById('btn-volver-flashcards').style.display = 'none';
  document.getElementById('foto-input').value = '';
  document.getElementById('btn-reset-top').style.display = 'none';
  document.getElementById('top-tabs').style.display = 'none';
  document.getElementById('btn-material').style.display = 'none';
  const preview = document.getElementById('preview-img');
  preview.src = '';
  preview.style.display = 'none';
  document.getElementById('upload-icon').style.display = 'block';
  document.getElementById('upload-text').style.display = 'block';
  document.getElementById('upload-sub').style.display = 'block';
  document
    .getElementById('upload-box')
    .classList.remove('has-image');
  document
    .getElementById('upload-box')
    .classList.remove('compact');
  document.getElementById('result-actions').style.display = 'none';
    const btn = document.getElementById('btn-procesar');
  btn.style.display = 'none';
  btn.disabled = false;
  btn.textContent = '✨ Generar experiencia';

  const videoResultado = document.getElementById('video-resultado');
  videoResultado.pause();
  videoResultado.currentTime = 0;
  videoResultado.src = '';

  const videoOriginal = document.getElementById('video-original');
  videoOriginal.pause();
  videoOriginal.currentTime = 0;
  
  flashcardIndex = -1;

  const flashcardFront = document.getElementById('flashcard-front');

  flashcardFront.innerHTML = `
  <div class="flashcard-number">
    Flashcards
  </div>
  <h3>
    Aprende mientras generamos tu video
  </h3>
  <p>
    Presiona “Siguiente” para conocer un poco más de la vida de nuestro personaje.
  </p>
`;

flashcardFront.className = 'flashcard card-front';
document.getElementById('foto-input').click();
}
flashcardsBtn.addEventListener("click", () => {
  flashcardsPanel.style.display = "flex";
  infographicContent.style.display = "none";
  videoContent.style.display = "none";
  flashcardsBtn.classList.add("active");
  infographicBtn.classList.remove("active");
  videoBtn.classList.remove("active");
  quizBtn.classList.remove("active");
  quizContent.style.display = "none";
});

infographicBtn.addEventListener("click", () => {
  flashcardsPanel.style.display = "none";
  document.getElementById("resultado-panel").style.display = "none";
  videoContent.style.display = "none";
  infographicContent.style.display = "flex";
  infographicBtn.classList.add("active");
  flashcardsBtn.classList.remove("active");
  videoBtn.classList.remove("active");
  quizBtn.classList.remove("active");
  quizContent.style.display = "none";
});

videoBtn.addEventListener("click", () => {
  flashcardsPanel.style.display = "none";
  infographicContent.style.display = "none";
  document.getElementById("resultado-panel").style.display = "none";
  videoContent.style.display = "flex";
  videoBtn.classList.add("active");
  flashcardsBtn.classList.remove("active");
  infographicBtn.classList.remove("active");
  quizBtn.classList.remove("active");
  quizContent.style.display = "none";
});

quizBtn.addEventListener("click", () => {
  flashcardsPanel.style.display = "none";
  infographicContent.style.display = "none";
  videoContent.style.display = "none";
  document.getElementById("resultado-panel").style.display = "none";
  quizContent.style.display = "flex";
  quizBtn.classList.add("active");
  videoBtn.classList.remove("active");
  flashcardsBtn.classList.remove("active");
  infographicBtn.classList.remove("active");
  renderQuizQuestion();
});