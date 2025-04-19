
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const userLogin = "http://localhost:5000/users/login"
    const adminLogin = "http://localhost:5000/admins/login"


    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            const userName = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const role = document.getElementById("role").value;
            console.log(role)
            const loginUrl = role === "user"
                ? userLogin
                : adminLogin;
         
            clearErrors();

           
            if (!validateLoginData(userName, password)) return;

            try {
                const response = await fetch(loginUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName, password }),
                });
                const data = await response.json();

                if (response.ok) {

                    console.log("Login data", data)
                    role === "user" ? localStorage.setItem("jwtTokenUser", data.message) : localStorage.setItem("jwtTokenAdmin", data.message);
                    role === "user" ? window.location.href = "user-dashboard.html" : window.location.href = "admin-dashboard.html";
                } else {
                    document.getElementById("generalError").innerHTML = `Login Failed: ${data.message}`;
                }
            } catch (error) {
                document.getElementById("generalError").innerHTML = "Something went wrong! Please try again.";
            }
        });

        ["username", "password"].forEach((id) => {
            document.getElementById(id) && document.getElementById(id).addEventListener("input", () => {
                document.getElementById(`${id}Error`).innerHTML = "";
            });
        });
    }
});


function validateLoginData(userName, password) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    let isValid = true;

    if (!userName) {
        document.getElementById("emailError").innerHTML = "Email is required!";
        isValid = false;
    } else if (!emailRegex.test(userName)) {
        document.getElementById("emailError").innerHTML = "Invalid email format!";
        isValid = false;
    }

    if (!password) {
        document.getElementById("passwordError").innerHTML = "Password is required!";
        isValid = false;
    } else if (!passwordRegex.test(password)) {
        document.getElementById("passwordError").innerHTML =
            "Password must be 8+ characters, including letters, numbers & special characters.";
        isValid = false;
    }

    return isValid;
}


