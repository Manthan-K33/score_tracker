const STORAGE_KEYS = {
    SCORES: "scores",
    BEST_SCORE: "bestScore",
    LAST_SCORE: "lastScore",
    PLAYER_NAME: "playerName",
    GAMES_PLAYED: "gamesPlayed",
    STREAK: "streak",
    BEST_STREAK: "bestStreak",
    ACHIEVEMENTS: "achievements",
    THEME: "theme",
    RECORD_DATE: "recordDate",
    LAST_PLAYED: "lastPlayed",
    ACHIEVEMENT_HISTORY: "achievementHistory"
};

const RANKS = [
    { name: "🥉 Beginner", min: 10 },
    { name: "🥈 Skilled", min: 50 },
    { name: "🥇 Master", min: 100 },
    { name: "💎 Elite", min: 250 },
    { name: "👑 Legend", min: 500 },
    { name: "🚀 Champion", min: 1000 }
];

let scores =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.SCORES
        )
    ) || [];

let achievements =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.ACHIEVEMENTS
        )
    ) || [];

let achievementHistory =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.ACHIEVEMENT_HISTORY
        )
    ) || [];

let bestScore =
    Number(
        localStorage.getItem(
            STORAGE_KEYS.BEST_SCORE
        )
    ) || 0;

let lastScore =
    Number(
        localStorage.getItem(
            STORAGE_KEYS.LAST_SCORE
        )
    ) || 0;

let gamesPlayed =
    Number(
        localStorage.getItem(
            STORAGE_KEYS.GAMES_PLAYED
        )
    ) || 0;

let streak =
    Number(
        localStorage.getItem(
            STORAGE_KEYS.STREAK
        )
    ) || 0;

let bestStreak =
    Number(
        localStorage.getItem(
            STORAGE_KEYS.BEST_STREAK
        )
    ) || 0;

function handleNameEnter(event) {

    if (event.key === "Enter") {

        document
            .getElementById(
                "scoreInput"
            )
            .focus();
    }
}

function handleScoreEnter(event) {

    if (event.key === "Enter") {

        saveScore();
    }
}

function saveScore() {

    const playerInput =
        document.getElementById(
            "playerName"
        );

    const scoreInput =
        document.getElementById(
            "scoreInput"
        );

    let player =
        playerInput.value.trim();

    if (player.length > 0) {

        player =
            player.charAt(0)
            .toUpperCase() +
            player.slice(1);
    }

    let score =
        Number(
            scoreInput.value
        );

    if (isNaN(score)) {

        score = 0;
    }

    const now =
        new Date();

    scores.push({
        player,
        score,
        date:
            now.toLocaleString()
    });

    localStorage.setItem(
        STORAGE_KEYS.SCORES,
        JSON.stringify(scores)
    );

    localStorage.setItem(
        STORAGE_KEYS.PLAYER_NAME,
        player
    );

    localStorage.setItem(
        STORAGE_KEYS.LAST_PLAYED,
        now.toLocaleString()
    );

    gamesPlayed++;

    localStorage.setItem(
        STORAGE_KEYS.GAMES_PLAYED,
        gamesPlayed
    );

    if (score > lastScore) {

        streak++;

    } else {

        streak = 0;
    }

    if (streak > bestStreak) {

        bestStreak = streak;

        localStorage.setItem(
            STORAGE_KEYS.BEST_STREAK,
            bestStreak
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.STREAK,
        streak
    );

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            STORAGE_KEYS.BEST_SCORE,
            bestScore
        );

        localStorage.setItem(
            STORAGE_KEYS.RECORD_DATE,
            now.toLocaleString()
        );

        showMessage(
            "🎉 New Record!"
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.LAST_SCORE,
        score
    );

    lastScore = score;

    checkAchievements(
        score
    );

    refreshUI();

    scoreInput.value = "0";
}

function checkAchievements(score) {

    RANKS.forEach(rank => {

        if (
            score >= rank.min &&
            !achievements.includes(
                rank.name
            )
        ) {

            achievements.push(
                rank.name
            );

            achievementHistory.push({
                achievement:
                    rank.name,
                date:
                    new Date()
                    .toLocaleString()
            });

            localStorage.setItem(
                STORAGE_KEYS.ACHIEVEMENTS,
                JSON.stringify(
                    achievements
                )
            );

            localStorage.setItem(
                STORAGE_KEYS.ACHIEVEMENT_HISTORY,
                JSON.stringify(
                    achievementHistory
                )
            );

            showPopup(
                rank.name
            );
        }
    });
}

function showPopup(text) {

    const popup =
        document.getElementById(
            "popup"
        );

    popup.textContent =
        "🏆 Unlocked: " +
        text;

    popup.classList.add(
        "show"
    );

    setTimeout(() => {

        popup.classList.remove(
            "show"
        );

    }, 3000);
}

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent =
        text;

    setTimeout(() => {

        message.textContent =
            "";

    }, 3000);
}
function calculateAverage(arr) {

    if (arr.length === 0) {
        return 0;
    }

    return (
        arr.reduce(
            (a, b) => a + b,
            0
        ) / arr.length
    ).toFixed(1);
}

function calculateMedian(arr) {

    if (arr.length === 0) {
        return 0;
    }

    const sorted =
        [...arr].sort(
            (a, b) => a - b
        );

    const middle =
        Math.floor(
            sorted.length / 2
        );

    if (
        sorted.length % 2 === 0
    ) {

        return (
            (
                sorted[middle - 1] +
                sorted[middle]
            ) / 2
        ).toFixed(1);
    }

    return sorted[middle];
}

function updateStatistics() {

    const values =
        scores.map(
            item => item.score
        );

    document.getElementById(
        "statHighest"
    ).textContent =
        values.length
            ? Math.max(...values)
            : 0;

    document.getElementById(
        "statLowest"
    ).textContent =
        values.length
            ? Math.min(...values)
            : 0;

    document.getElementById(
        "statAverage"
    ).textContent =
        calculateAverage(values);

    document.getElementById(
        "statMedian"
    ).textContent =
        calculateMedian(values);

    document.getElementById(
        "statLastFive"
    ).textContent =
        calculateAverage(
            values.slice(-5)
        );

    document.getElementById(
        "statTotal"
    ).textContent =
        values.length;
}

function updateAchievementCount() {

    const count =
        document.getElementById(
            "achievementCount"
        );

    if (!count) return;

    count.textContent =
        `Total Unlocked: ${achievements.length}`;
}

function renderAchievements() {

    const list =
        document.getElementById(
            "achievementList"
        );

    if (!list) return;

    if (
        achievements.length === 0
    ) {

        list.innerHTML =
            "<li>No achievements unlocked yet.</li>";

        return;
    }

    list.innerHTML =
        achievements
        .map(item =>
            `<li>${item}</li>`
        )
        .join("");
}

function renderAchievementHistory() {

    const list =
        document.getElementById(
            "achievementHistory"
        );

    if (!list) return;

    if (
        achievementHistory.length === 0
    ) {

        list.innerHTML =
            "<li>No achievements unlocked yet.</li>";

        return;
    }

    list.innerHTML =
        achievementHistory
        .slice()
        .reverse()
        .map(item => `
            <li>
                ${item.achievement}
                <br>
                <small>${item.date}</small>
            </li>
        `)
        .join("");
}

function renderLeaderboard() {

    const board =
        document.getElementById(
            "leaderboard"
        );

    if (!board) return;

    if (scores.length === 0) {

        board.innerHTML =
            `<li>No scores yet. Play your first game!</li>`;

        return;
    }

    const topScores =
        [...scores]
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(0, 10);

    board.innerHTML =
        topScores
        .map(item => `
            <li>
                ${item.player}
                — ${item.score}
            </li>
        `)
        .join("");
}

function renderHistory() {

    const history =
        document.getElementById(
            "historyList"
        );

    if (!history) return;

    if (scores.length === 0) {

        history.innerHTML =
            `<li>No score history available.</li>`;

        return;
    }

    history.innerHTML =
        scores
        .slice()
        .reverse()
        .map(item => `
            <li>
                <strong>${item.player}</strong>
                - ${item.score}
                <br>
                <small>${item.date}</small>
            </li>
        `)
        .join("");
}

function updatePerformanceRating() {

    const rating =
        document.getElementById(
            "performanceRating"
        );

    if (!rating) return;

    const average =
        Number(
            calculateAverage(
                scores.map(
                    item =>
                        item.score
                )
            )
        );

    if (average >= 1000) {

        rating.textContent =
            "🚀 Champion Player";

    } else if (
        average >= 500
    ) {

        rating.textContent =
            "👑 Legendary Player";

    } else if (
        average >= 250
    ) {

        rating.textContent =
            "💎 Elite Player";

    } else if (
        average >= 100
    ) {

        rating.textContent =
            "🥇 Master Player";

    } else if (
        average >= 50
    ) {

        rating.textContent =
            "🥈 Skilled Player";

    } else {

        rating.textContent =
            "🌱 Beginner Player";
    }
}

function updateTrendIndicator() {

    const trend =
        document.getElementById(
            "trendIndicator"
        );

    if (!trend) return;

    if (scores.length < 6) {

        trend.textContent =
            "➡️ Not enough data yet";

        return;
    }

    const recent =
        scores
        .slice(-5)
        .map(
            item =>
                item.score
        );

    const previous =
        scores
        .slice(-10, -5)
        .map(
            item =>
                item.score
        );

    const recentAvg =
        Number(
            calculateAverage(
                recent
            )
        );

    const previousAvg =
        previous.length
            ? Number(
                calculateAverage(
                    previous
                )
            )
            : recentAvg;

    if (
        recentAvg >
        previousAvg
    ) {

        trend.textContent =
            "📈 Improving";

    } else if (
        recentAvg <
        previousAvg
    ) {

        trend.textContent =
            "📉 Declining";

    } else {

        trend.textContent =
            "➡️ Stable";
    }
}
function updateAchievementProgress() {

    const totalAchievements = RANKS.length;

    const unlocked = achievements.length;

    const percent =
        Math.round(
            (unlocked / totalAchievements) * 100
        );

    const text =
        document.getElementById(
            "achievementProgressText"
        );

    const progressBar =
        document.getElementById(
            "achievementProgressBar"
        );

    const progressPercent =
        document.getElementById(
            "achievementProgressPercent"
        );

    if (text) {
        text.textContent =
            `${unlocked} / ${totalAchievements} Unlocked`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${percent}%`;
    }

    if (progressPercent) {
        progressPercent.textContent =
            `${percent}%`;
    }
}

function updateProgressBar() {

    const progressBar =
        document.getElementById(
            "progressBar"
        );

    const progressPercent =
        document.getElementById(
            "progressPercent"
        );

    const nextRankText =
        document.getElementById(
            "nextRankText"
        );

    if (
        !progressBar ||
        !progressPercent ||
        !nextRankText
    ) {
        return;
    }

    const nextRank =
        RANKS.find(
            rank =>
                bestScore < rank.min
        );

    if (!nextRank) {

        progressBar.style.width =
            "100%";

        progressPercent.textContent =
            "100%";

        nextRankText.textContent =
            "🏆 Maximum Rank Reached";

        return;
    }

    const previousRank =
        [...RANKS]
        .reverse()
        .find(
            rank =>
                bestScore >= rank.min
        );

    const previousValue =
        previousRank
            ? previousRank.min
            : 0;

    const progress =
        (
            (
                bestScore -
                previousValue
            ) /
            (
                nextRank.min -
                previousValue
            )
        ) * 100;

    const safeProgress =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(progress)
            )
        );

    progressBar.style.width =
        `${safeProgress}%`;

    progressPercent.textContent =
        `${safeProgress}%`;

    nextRankText.textContent =
        `Reach ${nextRank.min} for ${nextRank.name}`;
}

function refreshUI() {

    document.getElementById(
        "bestScore"
    ).textContent =
        bestScore;

    document.getElementById(
        "lastScore"
    ).textContent =
        lastScore;

    document.getElementById(
        "gamesPlayed"
    ).textContent =
        gamesPlayed;

    document.getElementById(
        "streak"
    ).textContent =
        streak;

    document.getElementById(
        "bestStreak"
    ).textContent =
        bestStreak;

    document.getElementById(
        "savedPlayer"
    ).textContent =
        localStorage.getItem(
            STORAGE_KEYS.PLAYER_NAME
        ) || "None";

    document.getElementById(
        "recordDate"
    ).textContent =
        "Record Date: " +
        (
            localStorage.getItem(
                STORAGE_KEYS.RECORD_DATE
            ) || "Never"
        );

    document.getElementById(
        "lastPlayed"
    ).textContent =
        localStorage.getItem(
            STORAGE_KEYS.LAST_PLAYED
        ) || "Never";

    updateStatistics();

    updatePerformanceRating();

    updateTrendIndicator();

    updateGoalTracker();

    updateHighestRank();

    updateAchievementCount();

    renderAchievementList();

    renderAchievementHistory();

    renderLeaderboard();

    renderHistory();

    updatePersonalBestChallenge();

    updateProgressBar();

    updateAchievementProgress();

    drawChart();
}

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );

    localStorage.setItem(
        STORAGE_KEYS.THEME,
        document.body.classList.contains(
            "light-mode"
        )
    );
}

function resetData() {

    if (
        !confirm(
            "Reset all saved data?"
        )
    ) {
        return;
    }

    localStorage.clear();

    location.reload();
}

function exportScores() {

    const data =
        JSON.stringify(
            scores,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type:
                "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "score-tracker-data.json";

    a.click();

    URL.revokeObjectURL(url);
}

function clearHistory() {

    if (
        !confirm(
            "Clear score history?"
        )
    ) {
        return;
    }

    scores = [];

    localStorage.setItem(
        STORAGE_KEYS.SCORES,
        JSON.stringify([])
    );

    refreshUI();
}

function updateClock() {

    const clock =
        document.getElementById(
            "currentTime"
        );

    if (clock) {

        clock.textContent =
            new Date()
            .toLocaleString();
    }
}

function loadPlayerName() {

    const savedName =
        localStorage.getItem(
            STORAGE_KEYS.PLAYER_NAME
        );

    if (savedName) {

        document.getElementById(
            "playerName"
        ).value =
            savedName;

        const welcome =
            document.getElementById(
                "welcomeMessage"
            );

        if (welcome) {

            welcome.textContent =
                `Welcome back, ${savedName} 👋`;
        }
    }
}

if (
    localStorage.getItem(
        STORAGE_KEYS.THEME
    ) === "true"
) {

    document.body.classList.add(
        "light-mode"
    );
}

window.addEventListener(
    "resize",
    drawChart
);

setInterval(
    updateClock,
    1000
);

updateClock();

loadPlayerName();

refreshUI();