const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });


        const data = await response.json();

        message.textContent = data.message;


        if (response.ok) {

            localStorage.setItem("user", JSON.stringify(data.user));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        }

    } catch (error) {

        console.log(error);

        message.textContent =
            "Server error. Please try again.";

    }

});