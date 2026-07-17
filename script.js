let best =
    Number(
        localStorage.getItem("bestScore")
    ) || 0;

let player =
    localStorage.getItem("playerName")
    || "None";

document.getElementById(
    "bestScore"
).innerText = best;

document.getElementById(
    "savedPlayer"
).innerText = player;

function saveScore() {

    const name =
        document.getElementById(
            "playerName"
        ).value;

    const score =
        Number(
            document.getElementById(
                "scoreInput"
            ).value
        );

    if (name) {

        localStorage.setItem(
            "playerName",
            name
        );

        document.getElementById(
            "savedPlayer"
        ).innerText = name;
    }

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

        message +=
            "🎉 New Personal Best! ";
    }

    const achievements = [];

    if (score >= 10) {

        achievements.push(
            "🥉 Beginner"
        );
    }

    if (score >= 50) {

        achievements.push(
            "🥈 Skilled"
        );
    }

    if (score >= 100) {

        achievements.push(
            "🥇 Master"
        );
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

    document.getElementById(
        "message"
    ).innerText =
        message || "Score Saved";
}

function resetData() {

    if (
        confirm(
            "Are you sure you want to reset all data?"
        )
    ) {

        localStorage.clear();

        location.reload();
    }
}