const people = [

  { name: "Rubab", photo: "rubab.jpeg" },

  { name: "Dumbo", photo: "dumbo.jpeg" },

  { name: "Saba", photo: "saba.jpeg" },

  { name: "Shahbaz", photo: "shahbaz.jpeg" },

  { name: "Zeemal", photo: "zeemal.jpeg" },

  { name: "Bilal", photo: "bilal.jpeg" }

];

const categories = [

  "Brave",

  "Smart",

  "Good-looking",

  "Hardworking",

  "Aggressive",

  "Annoying",

  "Stupid"

];

let ratings = JSON.parse(

  localStorage.getItem("rateTheFamRatings") || "{}"

);

let currentPerson = null;

let currentScores = {};

const $ = id => document.getElementById(id);

function saveRatings() {

  localStorage.setItem(

    "rateTheFamRatings",

    JSON.stringify(ratings)

  );

}

function showView(view) {

  [

    "homeView",

    "personView",

    "resultsView",

    "leaderboardView"

  ].forEach(id => {

    $(id).classList.add("hidden");

  });

  $(view).classList.remove("hidden");

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

  $("backBtn").classList.toggle(

    "hidden",

    view === "homeView"

  );

}

function renderHome() {

  $("peopleGrid").innerHTML = people.map((person, index) => {

    const alreadyRated = ratings[person.name];

    return `

      <button

        class="person-card"

        onclick="openPerson(${index})"

      >

        <img

          src="${person.photo}"

          alt="${person.name}"

        >

        <h2>${person.name}</h2>

        <p>

          ${

            alreadyRated

              ? `Rated • ${getPercentage(person.name)}%`

              : "Tap to rate 💕"

          }

        </p>

      </button>

    `;

  }).join("");

}

function openPerson(index) {

  currentPerson = people[index];

  currentScores = ratings[currentPerson.name]

    ? { ...ratings[currentPerson.name] }

    : Object.fromEntries(

        categories.map(category => [category, 0])

      );

  $("personPhoto").src = currentPerson.photo;

  $("personPhoto").alt = currentPerson.name;

  $("personName").textContent =

    currentPerson.name;

  $("errorText").textContent = "";

  renderCategories();

  showView("personView");

}

function renderCategories() {

  $("categories").innerHTML =

    categories.map(category => {

      const score =

        currentScores[category] || 0;

      return `

        <div class="category">

          <div class="category-title">

            <strong>

              ${category}

            </strong>

            <span class="rating-value">

              ${score}/5

            </span>

          </div>

          <div class="stars">

            ${[1,2,3,4,5].map(number => `

              <button

                class="star ${

                  number <= score

                    ? "selected"

                    : ""

                }"

                onclick="setScore('${category}', ${number})"

              >

                ★

              </button>

            `).join("")}

          </div>

        </div>

      `;

    }).join("");

}

function setScore(category, score) {

  currentScores[category] = score;

  renderCategories();

}

function getTotal(name) {

  const data = ratings[name] || {};

  return categories.reduce(

    (total, category) =>

      total + (Number(data[category]) || 0),

    0

  );

}

function getPercentage(name) {

  const maximum =

    categories.length * 5;

  return Math.round(

    (getTotal(name) / maximum) * 100

  );

}

function getStars(total) {

  const average =

    Math.round(total / categories.length);

  return (

    "★".repeat(average) +

    "☆".repeat(5 - average)

  );

}

$("submitBtn").onclick = function() {

  const missingCategory =

    categories.find(

      category =>

        !currentScores[category]

    );

  if (missingCategory) {

    $("errorText").textContent =

      `Please rate ${missingCategory} first!`;

    return;

  }

  ratings[currentPerson.name] = {

    ...currentScores

  };

  saveRatings();

  const total =

    getTotal(currentPerson.name);

  const percentage =

    getPercentage(currentPerson.name);

  $("resultTitle").textContent =

    `${currentPerson.name} has been rated! 🎉`;

  $("resultText").textContent =

    `They got ${total} out of ${

      categories.length * 5

    } stars.`;

  $("resultPercent").textContent =

    `${percentage}%`;

  $("resultStars").textContent =

    getStars(total);

  showView("resultsView");

};

$("nextBtn").onclick = function() {

  renderHome();

  showView("homeView");

};

$("leaderboardBtn").onclick = function() {

  renderLeaderboard();

  showView("leaderboardView");

};

$("homeBtn").onclick = function() {

  renderHome();

  showView("homeView");

};

$("backBtn").onclick = function() {

  renderHome();

  showView("homeView");

};

function renderLeaderboard() {

  const sortedPeople =

    [...people].sort(

      (a, b) =>

        getTotal(b.name) -

        getTotal(a.name)

    );

  $("leaderboard").innerHTML =

    sortedPeople.map((person, index) => {

      const hasRating =

        ratings[person.name];

      let medal = `#${index + 1}`;

      if (index === 0 && hasRating)

        medal = "🥇";

      if (index === 1 && hasRating)

        medal = "🥈";

      if (index === 2 && hasRating)

        medal = "🥉";

      return `

        <div class="leader-row">

          <div class="rank">

            ${hasRating ? medal : "—"}

          </div>

          <img

            src="${person.photo}"

            alt="${person.name}"

          >

          <div class="leader-info">

            <strong>

              ${person.name}

            </strong>

            <small>

              ${

                hasRating

                  ? `${getTotal(person.name)}/${categories.length * 5} stars`

                  : "Not rated yet"

              }

            </small>

          </div>

          <div class="leader-score">

            ${

              hasRating

                ? `${getPercentage(person.name)}%`

                : "—"

            }

          </div>

        </div>

      `;

    }).join("");

}

renderHome();