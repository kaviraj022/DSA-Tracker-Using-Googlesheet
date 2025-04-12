function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const icon = document.getElementById("themeIcon");
  icon.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
}

function showAddForm() {
  document.getElementById("addForm").classList.remove("hidden");
  const topicSelect = document.getElementById("topicSelect");
  topicSelect.innerHTML = '<option value="">-- Select Topic --</option>';

  document.querySelectorAll(".topic .collapsible span:nth-child(2)").forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.textContent;
    opt.textContent = t.textContent;
    topicSelect.appendChild(opt);
  });
}

function closeAddForm() {
  document.getElementById("addForm").classList.add("hidden");
}

function addProblem() {
  const topicName = document.getElementById("newTopicInput").value || document.getElementById("topicSelect").value;
  const difficulty = document.getElementById("difficultySelect").value;
  const name = document.getElementById("problemName").value;
  const yt = document.getElementById("ytLink").value;
  const pr = document.getElementById("practiceLink").value;
  const notes = document.getElementById("notesInput").value;

  if (!topicName || !difficulty || !name || !yt || !pr) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  const secret = prompt("🔐 Enter secret code to update Google Sheet:");
  if (!secret) return alert("⛔ Cancelled.");

  const baseUrl = "https://script.google.com/macros/s/AKfycbxu0ISABkZFX5AIJyXDWyrmhopKBGjy7TCzADGIBO6cStPRbG7PAT48Iob7IudGSfZIgQ/exec";
  const params = new URLSearchParams({
    mode: "add",
    secret,
    topic: topicName,
    difficulty,
    name,
    yt,
    pr,
    notes
  });

  fetch(`${baseUrl}?${params.toString()}`)
    .then(res => res.text())
    .then(msg => {
      const trimmed = msg.trim();
      console.log("Sheet response:", trimmed);
      if (trimmed === "Added") {
        alert("✅ Problem added to sheet!");
        fetchAndRenderProblems();
        closeAddForm();
      } else if (trimmed === "Already Exists") {
        alert("⚠️ This problem already exists.");
      } else if (trimmed === "Unauthorized") {
        alert("🔐 Wrong secret.");
      } else {
        alert("❌ Error: " + trimmed);
      }
    })
    .catch((err) => {
      alert("❌ JS Fetch Failed: " + err.message);
    });
}

function fetchAndRenderProblems() {
  const baseUrl = "https://script.google.com/macros/s/AKfycbxu0ISABkZFX5AIJyXDWyrmhopKBGjy7TCzADGIBO6cStPRbG7PAT48Iob7IudGSfZIgQ/exec";

  fetch(`${baseUrl}?mode=fetch`)
    .then(res => res.text())
    .then(text => {
      try {
        const data = JSON.parse(text);
        console.log("✅ Fetched data:", data);
        renderProblems(data);
      } catch (err) {
        console.error("❌ JSON parse error:", text);
        alert("❌ Invalid JSON response.");
      }
    })
    .catch(err => {
      console.error("❌ Fetch error:", err);
      alert("❌ Fetch failed: " + err.message);
    });
}

function renderProblems(data) {
  const container = document.getElementById("topicsContainer");
  container.innerHTML = "";

  const topicsMap = {};

  data.forEach(({ topic, difficulty, name, yt, pr, notes }) => {
    if (!topicsMap[topic]) topicsMap[topic] = {};
    if (!topicsMap[topic][difficulty]) topicsMap[topic][difficulty] = [];
    topicsMap[topic][difficulty].push({ name, yt, pr, notes });
  });

  Object.entries(topicsMap).forEach(([topic, difficulties]) => {
    const topicDiv = document.createElement("div");
    topicDiv.className = "topic";

    const topicHeader = document.createElement("div");
    topicHeader.className = "collapsible";
    topicHeader.innerHTML = `<span class="icon">▶</span> <span>${topic}</span>`;
    const topicContent = document.createElement("div");
    topicContent.style.display = "none";

    topicHeader.onclick = () => toggleCollapse(topicContent, topicHeader.querySelector(".icon"));

    topicDiv.appendChild(topicHeader);
    topicDiv.appendChild(topicContent);

    ["Easy", "Medium", "Hard"].forEach((diff) => {
      const problems = difficulties[diff];
      if (!problems) return;

      const diffDiv = document.createElement("div");
      diffDiv.className = "difficulty";
      diffDiv.dataset.diff = diff;

      const diffHeader = document.createElement("div");
      diffHeader.className = "collapsible";
      const diffIcon = document.createElement("span");
      diffIcon.className = "icon";
      diffIcon.textContent = "▶";
      diffHeader.appendChild(diffIcon);
      diffHeader.appendChild(document.createTextNode(diff));

      const diffContent = document.createElement("div");
      diffContent.className = "diff-content";
      diffContent.style.display = "none";

      diffHeader.onclick = () => toggleCollapse(diffContent, diffIcon);

      problems.forEach((p, i) => {
        const problem = document.createElement("div");
        problem.className = "problem";
        problem.innerHTML = `
          <span>#${i + 1}</span>
          <span>${p.name}</span>
          <a href="${p.yt}" target="_blank" class="icon" title="YouTube">🎥</a>
          <a href="${p.pr}" target="_blank" class="icon" title="Practice">💻</a>
          <span class="icon note-icon" data-note="${p.notes || ""}" title="Click to view/edit note">📝</span>
        `;
        diffContent.appendChild(problem);
      });

      diffDiv.appendChild(diffHeader);
      diffDiv.appendChild(diffContent);
      topicContent.appendChild(diffDiv);
    });

    container.appendChild(topicDiv);
  });
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("note-icon")) {
    document.querySelectorAll(".note-popup")?.forEach(popup => popup.remove()); // close any open

    const existingNote = e.target.dataset.note || "";
    const problemDiv = e.target.closest(".problem");
    const name = problemDiv.querySelector("span:nth-child(2)").textContent;
    const topic = problemDiv.closest(".topic").querySelector(".collapsible span:nth-child(2)").textContent;
    const difficulty = problemDiv.closest(".difficulty").dataset.diff;

    const noteBox = document.createElement("div");
    noteBox.className = "note-popup";

    noteBox.innerHTML = `
      <textarea placeholder="Write your note here...">${existingNote}</textarea>
      <div class="note-buttons">
        <button class="save-note">Save</button>
        <button class="close-note">Cancel</button>
      </div>
    `;

    document.body.appendChild(noteBox);

    noteBox.querySelector(".close-note").onclick = () => noteBox.remove();

    noteBox.querySelector(".save-note").onclick = () => {
      const newNote = noteBox.querySelector("textarea").value;
      const secret = prompt("🔐 Enter secret code to update note:");
      if (!secret) {
        alert("⛔ Cancelled.");
        return;
      }

      const baseUrl = "https://script.google.com/macros/s/AKfycbxu0ISABkZFX5AIJyXDWyrmhopKBGjy7TCzADGIBO6cStPRbG7PAT48Iob7IudGSfZIgQ/exec";
      const params = new URLSearchParams({
        mode: "updateNote",
        secret,
        topic,
        difficulty,
        name,
        notes: newNote
      });

      fetch(`${baseUrl}?${params.toString()}`)
        .then(res => res.text())
        .then(msg => {
          if (msg.trim() === "Updated") {
            alert("✅ Note updated!");
            e.target.dataset.note = newNote;
            fetchAndRenderProblems();
            noteBox.remove();
          } else if (msg.trim() === "Unauthorized") {
            alert("🔐 Wrong secret. Note not saved.");
          } else {
            alert("❌ Error: " + msg);
          }
        })
        .catch(err => {
          alert("❌ Network error: " + err.message);
        });
    };
  }
});


function toggleCollapse(contentDiv, icon) {
  const isOpen = contentDiv.style.display !== "none";
  contentDiv.style.display = isOpen ? "none" : "block";
  icon.textContent = isOpen ? "▶" : "▼";
}

function updateSearchSuggestions() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const suggestions = document.getElementById("searchSuggestions");
  suggestions.innerHTML = "";
  if (!input) return suggestions.classList.add("hidden");

  const matches = Array.from(document.querySelectorAll(".problem"))
    .map((p) => {
      const nameSpan = p.querySelector("span:nth-child(2)");
      return { text: nameSpan.textContent, el: p };
    })
    .filter(({ text }) => text.toLowerCase().includes(input));

  matches.forEach(({ text, el }) => {
    const div = document.createElement("div");
    div.textContent = text;

    div.onmousedown = (e) => {
      e.preventDefault();

      let topicContent = el.closest(".topic").querySelector("div:nth-child(2)");
      if (topicContent.style.display === "none") {
        topicContent.style.display = "block";
        const topicIcon = el.closest(".topic").querySelector(".collapsible .icon");
        if (topicIcon) topicIcon.textContent = "▼";
      }

      let diffContent = el.closest(".diff-content");
      if (diffContent && diffContent.style.display === "none") {
        diffContent.style.display = "block";
        const diffIcon = diffContent.parentElement.querySelector(".collapsible .icon");
        if (diffIcon) diffIcon.textContent = "▼";
      }

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid orange";
      setTimeout(() => (el.style.outline = ""), 1500);
      suggestions.classList.add("hidden");
    };

    suggestions.appendChild(div);
  });

  suggestions.classList.remove("hidden");
}


window.onload = fetchAndRenderProblems;
