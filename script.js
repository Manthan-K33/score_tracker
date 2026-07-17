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

document.getElementById("bestScore").innerText = best;
document.getElementById("savedPlayer").innerText = player;
document.getElementById("gamesPlayed").innerText = gamesPlayed;
document.getElementById("streak").innerText = streak;
document.getElementById("highestRank").innerText = highestRank;

updateProgress(best);

function saveScore() {

    const name =
        document.getElementById("playerName")
        .value
        .trim();

    const score =
        Number(
            document.getElementById("scoreInput")
            .value
        );

    if (isNaN(score)) {
        return;
    }

    if (name) {

        localStorage.setItem(
            "playerName",
            name
        );

        document.getElementById(
            "savedPlayer"
        ).innerText = name;
    }

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