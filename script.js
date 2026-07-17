let best =
    Number(localStorage.getItem("bestScore")) || 0;

let player =
    localStorage.getItem("playerName") || "None";

let gamesPlayed =
    Number(localStorage.getItem("gamesPlayed")) || 0;

let streak =
    Number(localStorage.getItem("streak")) || 0;

let highestRank =
    localStorage.getItem("highestRank") || "None";

let scoreHistory =
    JSON.parse(
        localStorage.getItem("scoreHistory")
    ) || [];

document.getElementById("bestScore").innerText = best;
document.getElementById("savedPlayer").innerText = player;
document.getElementById("gamesPlayed").innerText = gamesPlayed;
document.getElementById("streak").innerText = streak;
document.getElementById("highestRank").innerText = highestRank;

renderHistory();
renderLeaderboard();
updateProgress(best);

function handleNameEnter(event) {

    if (event.key === "Enter") {

        document
            .getElementById("scoreInput")
            .focus();
    }
}

function handleScoreEnter(event) {

    if (event.key === "Enter") {

        saveScore();
    }
}

function saveScore() {

    const nameInput =
        document.getElementById("playerName");

    const scoreInput =
        document.getElementById("scoreInput");

    let name =
        nameInput.value.trim();

    let score =
        Number(scoreInput.value);

    if (name.length > 0) {

        name =
            name.charAt(0).toUpperCase() +
            name.slice(1);

        nameInput.value = name;

        localStorage.setItem(
            "playerName",
            name
        );

        document.getElementById(
            "savedPlayer"
        ).innerText = name;
    }

    if (isNaN(score)) {

        score = 0;
    }

    if (score < 0) {

        score = 0;
    }

    scoreInput.value = score;

    const entry = {

        score: score,

        date:
            new Date().toLocaleString()
    };

    scoreHistory.push(entry);

    localStorage.setItem(
        "scoreHistory",
        JSON.stringify(scoreHistory)
    );

    renderHistory();
    renderLeaderboard();

    gamesPlayed++;

    localStorage.setItem(
        "gamesPlayed",
        gamesPlayed
    );

    document.getElementById(
        "gamesPlayed"
    ).innerText = gamesPlayed;

    let message = "";

    if (score > best) {

        best = score;

        localStorage.setItem(
            "bestScore",
            best
        );

        document.getElementById(
            "bestScore"
        ).innerText = best;

        streak++;

        localStorage.setItem(
            "streak",
            streak
        );

        document.getElementById(
            "streak"
        ).innerText = streak;

        message =
            "🎉 New Personal Best!";

        showPopup(
            "🏆 New Record!"
        );
    }
    else {

        streak = 0;

        localStorage.setItem(
            "streak",
            streak
        );

        document.getElementById(
            "streak"
        ).innerText = streak;
    }

    const achievements = [];

    let currentRank = "None";

    if (score >= 10) {

        achievements.push(
            "🥉 Beginner"
        );

        currentRank =
            "🥉 Beginner";
    }

    if (score >= 50) {

        achievements.push(
            "🥈 Skilled"
        );

        currentRank =
            "🥈 Skilled";
    }

    if (score >= 100) {

        achievements.push(
            "🥇 Master"
        );

        currentRank =
            "🥇 Master";
    }

    document.getElementById(
        "achievementList"
    ).innerHTML =
        achievements
        .map(
            achievement =>
            `<li>${achievement}</li>`
        )
        .join("");

    if (
        currentRank !== "None"
    ) {

        highestRank =
            currentRank;

        localStorage.setItem(
            "highestRank",
            highestRank
        );

        document.getElementById(
            "highestRank"
        ).innerText =
            highestRank;

        showPopup(
            currentRank +
            " unlocked!"
        );
    }

    updateProgress(score);

    document.getElementById(
        "message"
    ).innerText =
        message || "Score Saved";
}

function updateProgress(score) {

    let maxScore = 10;
    let nextRank = "🥉 Beginner";

    if (
        score >= 10 &&
        score < 50
    ) {

        maxScore = 50;
        nextRank = "🥈 Skilled";
    }

    else if (
        score >= 50 &&
        score < 100
    ) {

        maxScore = 100;
        nextRank = "🥇 Master";
    }

    else if (
        score >= 100
    ) {

        maxScore = 100;
        nextRank = "🏆 Max Rank";
    }

    const progress =
        Math.min(
            (score / maxScore) * 100,
            100
        );

    document.getElementById(
        "progressBar"
    ).style.width =
        progress + "%";

    document.getElementById(
        "nextRankText"
    ).innerText =
        "Next Rank: " +
        nextRank;
}

function renderHistory() {

    document.getElementById(
        "historyList"
    ).innerHTML =

        scoreHistory
        .slice()
        .reverse()
        .map(item =>

            `<li>
                ${item.score}
                - 
                ${item.date}
            </li>`

        )
        .join("");
}

function renderLeaderboard() {

    const topScores =

        scoreHistory
        .map(
            item => item.score
        )
        .sort(
            (a, b) => b - a
        )
        .slice(0, 10);

    document.getElementById(
        "leaderboard"
    ).innerHTML =

        topScores
        .map((score, index) => {

            if (index === 0)
                return `<li>🥇 ${score}</li>`;

            if (index === 1)
                return `<li>🥈 ${score}</li>`;

            if (index === 2)
                return `<li>🥉 ${score}</li>`;

            return `<li>${index + 1}. ${score}</li>`;
        })
        .join("");
}

function showPopup(text) {

    const popup =
        document.getElementById(
            "popup"
        );

    popup.innerText = text;

    popup.classList.add(
        "show"
    );

    setTimeout(() => {

        popup.classList.remove(
            "show"
        );

    }, 3000);
}

function clearHistory() {

    const confirmed =

        confirm(
            "Delete all score history?"
        );

    if (!confirmed) return;

    scoreHistory = [];

    localStorage.setItem(
        "scoreHistory",
        JSON.stringify([])
    );

    renderHistory();
    renderLeaderboard();
}

function resetData() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all saved data?"
        );

    if (confirmed) {

        localStorage.clear();

        location.reload();
    }
}