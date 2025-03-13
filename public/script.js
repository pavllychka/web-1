document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;
    const country = document.getElementById("country").value;
    const agreement = document.getElementById("agreement").checked;
    const photo = document.getElementById("photo").files[0];

   
    if (password !== confirmPassword) {
        alert("Паролі не співпадають!");
        return;
    }

    
    if (!agreement) {
        alert("Потрібно погодитися з умовами!");
        return;
    }

    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone", phone);
    formData.append("dob", dob);
    formData.append("country", country);
    formData.append("photo", photo);

    
    const response = await fetch("/register", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        alert("Реєстрація успішна!");
        document.getElementById("registrationForm").reset();
    } else {
        const error = await response.text();
        alert("Помилка: " + error);
    }
});
