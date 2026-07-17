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

let lastScore =
    Number(localStorage.getItem("lastScore")) || 0;

let lastPlayed =
    localStorage.getItem("lastPlayed") || "Never";

let unlockedRanks =
    JSON.parse(
        localStorage.getItem("unlockedRanks")
    ) || [];

let scoreHistory =
    JSON.parse(
        localStorage.getItem("scoreHistory")
    ) || [];

document.getElementById("bestScore").innerText = best;
document.getElementById("savedPlayer").innerText = player;
document.getElementById("gamesPlayed").innerText = gamesPlayed;
document.getElementById("streak").innerText = streak;
document.getElementById("highestRank").innerText = highestRank;
document.getElementById("lastScore").innerText = lastScore;
document.getElementById("lastPlayed").innerText = lastPlayed;

document.getElementById("welcomeMessage").innerText =
    player !== "None"
        ? `Welcome back, ${player} 👋`
        : "Welcome 👋";

document.getElementById("playerName").focus();

renderHistory();
renderLeaderboard();
updateProgress(best);
updateStatistics();
startClock();

function startClock() {

    updateClock();

    setInterval(updateClock, 1000);
}

function updateClock() {

    document.getElementById(
        "currentTime"
    ).innerText =
        new Date().toLocaleString();
}

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

        player = name;

        localStorage.setItem(
            "playerName",
            name
        );

        document.getElementById(
            "savedPlayer"
        ).innerText = name;

        document.getElementById(
            "welcomeMessage"
        ).innerText =
            `Welcome back, ${name} 👋`;
    }

    if (isNaN(score) || score < 0) {

        score = 0;
    }

    if (score > 100000) {

        score = 100000;
    }

    const now =
        new Date().toLocaleString();

    lastScore = score;
    lastPlayed = now;

    localStorage.setItem(
        "lastScore",
        score
    );

    localStorage.setItem(
        "lastPlayed",
        now
    );

    document.getElementById(
        "lastScore"
    ).innerText = score;

    document.getElementById(
        "lastPlayed"
    ).innerText = now;

    const entry = {

        score: score,

        date: now
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

        const improvement =
            score - best;

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
            `🎉 New Personal Best! (+${improvement})`;

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
            a => `<li>${a}</li>`
        )
        .join("");

    if (
        currentRank !== "None" &&
        !unlockedRanks.includes(currentRank)
    ) {

        unlockedRanks.push(
            currentRank
        );

        localStorage.setItem(
            "unlockedRanks",
            JSON.stringify(unlockedRanks)
        );

        showPopup(
            currentRank +
            " unlocked!"
        );
    }

    highestRank = currentRank;

    localStorage.setItem(
        "highestRank",
        highestRank
    );

    document.getElementById(
        "highestRank"
    ).innerText =
        highestRank;

    updateProgress(score);
    updateStatistics();

    document.getElementById(
        "message"
    ).innerText =
        message || "Score Saved";

    scoreInput.value = 0;
}

function updateProgress(score) {

    let maxScore = 10;
    let nextRank = "🥉 Beginner";

    if (score >= 10 && score < 50) {

        maxScore = 50;
        nextRank = "🥈 Skilled";
    }

    else if (score >= 50 && score < 100) {

        maxScore = 100;
        nextRank = "🥇 Master";
    }

    else if (score >= 100) {

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

    const history =
        document.getElementById(
            "historyList"
        );

    if (scoreHistory.length === 0) {

        history.innerHTML =
            "<li>No score history available.</li>";

        return;
    }

    history.innerHTML =
        scoreHistory
        .slice()
        .reverse()
        .map(item =>
            `<li>${item.score} - ${item.date}</li>`
        )
        .join("");
}

function renderLeaderboard() {

    const leaderboard =
        document.getElementById(
            "leaderboard"
        );

    const topScores =
        scoreHistory
        .map(item => item.score)
        .sort((a, b) => b - a)
        .slice(0, 10);

    if (topScores.length === 0) {

        leaderboard.innerHTML =
            "<li>No scores yet. Play your first game!</li>";

        return;
    }

    leaderboard.innerHTML =
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

function updateStatistics() {

    if (scoreHistory.length === 0) {

        document.getElementById("statHighest").innerText = 0;
        document.getElementById("statLowest").innerText = 0;
        document.getElementById("statAverage").innerText = 0;
        document.getElementById("statTotal").innerText = 0;

        return;
    }

    const scores =
        scoreHistory.map(
            item => item.score
        );

    const highest =
        Math.max(...scores);

    const lowest =
        Math.min(...scores);

    const average =
        (
            scores.reduce(
                (a, b) => a + b,
                0
            ) / scores.length
        ).toFixed(1);

    document.getElementById("statHighest").innerText = highest;
    document.getElementById("statLowest").innerText = lowest;
    document.getElementById("statAverage").innerText = average;
    document.getElementById("statTotal").innerText = scores.length;
}

function showPopup(text) {

    const popup =
        document.getElementById(
            "popup"
        );

    popup.innerText = text;

    popup.classList.add("show");

    setTimeout(() => {

        popup.classList.remove(
            "show"
        );

    }, 3000);
}

function clearHistory() {

    if (
        !confirm(
            "Delete all score history?"
        )
    ) {
        return;
    }

    scoreHistory = [];

    localStorage.setItem(
        "scoreHistory",
        JSON.stringify([])
    );

    renderHistory();
    renderLeaderboard();
    updateStatistics();
}

function resetData() {

    if (
        confirm(
            "Are you sure you want to reset all saved data?"
        )
    ) {

        localStorage.clear();

        location.reload();
    }
}