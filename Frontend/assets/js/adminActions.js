


document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("jwtTokenAdmin");

    if (!token) {
        window.location.href = "/pages/login.html";
        window.alert("Session expired. Please login again")
        return;
    }

    try {

        const response = await fetch("http://localhost:5000/admins/get-admin", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const json = await response.json()
        if (!response.ok) {
            
            window.alert(json?json.message  : "An unexpected erro occurred")
            window.location.href = "/pages/login.html";
            return;
        }


        const data = await response.json();


        if (typeof data.message === "string") {

            
            window.alert(data.message)
            window.location.href = "/pages/login.html";
        } else {

            const { userId, userName, password } = data.message;

            console.log(userId, userName, password)

            const usernameContainer = document.getElementById("username-container");
            const creditsContainer = document.getElementById("credits-container");
            usernameContainer && (usernameContainer.innerHTML = userName.toString());
            creditsContainer && (creditsContainer.innerHTML = creditsRemaining.toString());



        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        window.location.href = "/pages/login.html";
    }
});