let currentNoteProblem = null;

function addTopic() {
  const topicName = document.getElementById("topicInput").value.trim();
  if (!topicName) return;

  const container = document.createElement("div");
  container.className = "topic";

  container.innerHTML = `
    <div class="topic-header" onclick="toggleCollapse(this)">
      <span>${topicName}</span>
      <button onclick="event.stopPropagation(); deleteTopic(this)">Delete</button>
    </div>
    <div class="categories hidden">
      ${["Easy", "Medium", "Hard"].map(level => `
        <div class="category-section">
          <h3>${level}
            <button onclick="addProblem(this)">Add Problem</button>
          </h3>
          <div class="problems"></div>
        </div>
      `).join("")}
    </div>
  `;

  document.getElementById("topicsContainer").appendChild(container);
  document.getElementById("topicInput").value = "";
}

function toggleCollapse(header) {
  const categories = header.nextElementSibling;
  categories.classList.toggle("hidden");
}

function addProblem(btn) {
  const container = btn.closest(".category-section").querySelector(".problems");

  const div = document.createElement("div");
  div.className = "problem";
  div.innerHTML = `
    <input placeholder="Problem Name" />
    <input placeholder="YouTube Link" />
    <input placeholder="Practice Link" />
    <input placeholder="Notes" />
    <div class="actions">
      <button onclick="saveProblem(this)">Save</button>
    </div>
  `;
  container.appendChild(div);
}

function saveProblem(btn) {
  const problem = btn.closest(".problem");
  const [nameInput, ytInput, practiceInput, notesInput] = problem.querySelectorAll("input");
  const name = nameInput.value.trim();
  const yt = ytInput.value.trim();
  const practice = practiceInput.value.trim();
  const notes = notesInput.value.trim();

  problem.dataset.notes = notes;

  problem.innerHTML = `
    <span class="name">${name}</span>
    <a class="icon" href="${yt}" target="_blank" title="YouTube">
      <img src="https://img.icons8.com/ios-filled/24/youtube-play.png"/>
    </a>
    <a class="icon" href="${practice}" target="_blank" title="Practice">
      <img src="https://img.icons8.com/ios-filled/24/code.png"/>
    </a>
    <span class="icon" title="Notes" onclick="showNotePopup(this)">
      <img src="https://img.icons8.com/ios-filled/24/note.png"/>
    </span>
    <div class="actions">
      <button onclick="editProblem(this)">Edit</button>
      <button onclick="this.closest('.problem').remove()">Delete</button>
    </div>
  `;
}

function editProblem(btn) {
  const problem = btn.closest(".problem");
  const name = problem.querySelector(".name").textContent;
  const yt = problem.querySelectorAll("a")[0]?.href || "";
  const practice = problem.querySelectorAll("a")[1]?.href || "";
  const notes = problem.dataset.notes || "";

  problem.innerHTML = `
    <input value="${name}" />
    <input value="${yt}" />
    <input value="${practice}" />
    <input value="${notes}" />
    <div class="actions">
      <button onclick="saveProblem(this)">Save</button>
      <button onclick="this.closest('.problem').remove()">Delete</button>
    </div>
  `;
}

function showNotePopup(icon) {
  currentNoteProblem = icon.closest(".problem");
  const popup = document.getElementById("notePopup");
  document.getElementById("noteContent").value = currentNoteProblem.dataset.notes || "";
  popup.classList.remove("hidden");
}

function saveNote() {
  if (!currentNoteProblem) return;
  currentNoteProblem.dataset.notes = document.getElementById("noteContent").value;
  closeNote();
}

function closeNote() {
  document.getElementById("notePopup").classList.add("hidden");
  currentNoteProblem = null;
}

function deleteTopic(btn) {
  btn.closest(".topic").remove();
}

function searchTopics() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".topic").forEach(topic => {
    const name = topic.querySelector(".topic-header span").textContent.toLowerCase();
    topic.style.display = name.includes(search) ? "" : "none";
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
