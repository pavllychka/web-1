let currentUserId = null;

async function loadUsers() {
  try {
    const response = await fetch("/users");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Помилка завантаження користувачів: ${errorText}`);
    }
    const users = await response.json();

    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";

    users.forEach(user => {
      // Якщо ідентифікатор користувача зберігається як _id, використовується він.
      const userId = user.id || user._id;
      const div = document.createElement("div");
      div.className = "user-card";
      div.innerHTML = `
        <img src="${user.photo}" width="50" height="50">
        <span>${user.name} (${user.email})</span>
        <button class="edit-btn" data-id="${userId}">✏️</button>
        <button class="delete-btn" data-id="${userId}">❌</button>
      `;
      usersList.appendChild(div);
    });

    // Обробники подій для кнопок редагування
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", () => openEditModal(button.dataset.id));
    });

    // Обробники подій для кнопок видалення
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", () => deleteUser(button.dataset.id));
    });
  } catch (err) {
    console.error(err);
  }
}

function openEditModal(id) {
  currentUserId = id;
  fetch(`/users/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Помилка отримання даних користувача з id ${id}`);
      }
      return response.json();
    })
    .then(user => {
      if (!user) {
        console.error("Користувача не знайдено для id:", id);
        return;
      }
      document.getElementById("editName").value = user.name || "";
      document.getElementById("editEmail").value = user.email || "";
      document.getElementById("editPhone").value = user.phone || "";
      document.getElementById("editDob").value = user.dob || "";
      document.getElementById("editCountry").value = user.country || "";
      document.getElementById("editModal").style.display = "block";
    })
    .catch(err => console.error(err));
}

// Закриття модального вікна
const closeBtn = document.querySelector(".close");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
  });
} else {
  console.warn("Елемент з класом .close не знайдено.");
}

// Обробка форми редагування
document.getElementById("editForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("editName").value);
  formData.append("email", document.getElementById("editEmail").value);
  formData.append("phone", document.getElementById("editPhone").value);
  formData.append("dob", document.getElementById("editDob").value);
  formData.append("country", document.getElementById("editCountry").value);

  // Додаємо фотографію лише, якщо вибрано файл
  const photoInput = document.getElementById("editPhoto");
  if (photoInput && photoInput.files.length > 0) {
    formData.append("photo", photoInput.files[0]);
  }

  try {
    const response = await fetch(`/users/${currentUserId}`, {
      method: "PUT",
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Помилка редагування користувача: ${errorText}`);
    }
    // Після успішного оновлення закриваємо модальне вікно та перезавантажуємо список користувачів
    document.getElementById("editModal").style.display = "none";
    loadUsers();
  } catch (err) {
    console.error(err);
  }
});

// Видалення користувача
async function deleteUser(id) {
  try {
    const response = await fetch(`/users/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Помилка видалення користувача: ${errorText}`);
    }
    loadUsers();
  } catch (err) {
    console.error(err);
  }
}

// Завантаження списку користувачів при завантаженні сторінки
window.addEventListener("load", loadUsers);



