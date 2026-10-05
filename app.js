const form = document.getElementById("studentForm");

const message = document.getElementById("message");

const submitButton = document.getElementById("submitButton");


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.className = "";

    message.textContent = "";

    submitButton.disabled = true;

    submitButton.textContent = "Registering...";


    const student = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        course: document.getElementById("course").value

    };


    try {

        const response = await fetch(
            "/.netlify/functions/students-create",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(student)
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Registration failed."
            );

        }


        message.className = "success";

        message.textContent =
            "Student registered successfully!";


        form.reset();


    } catch (error) {

        console.error(error);

        message.className = "error";

        message.textContent =
            error.message ||
            "Something went wrong.";

    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "Register Student";

    }

});
