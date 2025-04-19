
document.addEventListener("DOMContentLoaded", () => {
     const signupUrl = "http://localhost:5000/users/sign-up"
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            clearErrors();

            if (!validateData(email, password, confirmPassword)) return;

            try {
                const response = await fetch(signupUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName: email, password: password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem("jwtTokenUser", data.message);
                    window.location.href = "user-dashboard.html";
                } else {
                    document.getElementById("generalError").innerHTML = `Signup Failed: ${data.message}`;
                }
            } catch (error) {
                document.getElementById("generalError").innerHTML = "Something went wrong! Please try again.";
            }
        });

        ["email", "password", "confirmPassword"].forEach((id) => {
            document.getElementById(id).addEventListener("input", () => {
                document.getElementById(`${id}Error`).innerHTML = "";
            });
        });
    }
});

function validateData(email, password, confirmPassword) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    let isValid = true;

    if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerHTML = "Invalid email format!";
        isValid = false;
    }
    if (!passwordRegex.test(password)) {
        document.getElementById("passwordError").innerHTML = "Password must be 8+ characters, including letters, numbers & special characters.";
        isValid = false;
    }
    if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").innerHTML = "Passwords do not match!";
        isValid = false;
    }

    return isValid;
}

