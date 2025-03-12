const express = require("express");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // для доступу до завантажених фото

let users = require("./clients.json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

const saveUsers = () =>
  fs.writeFileSync("clients.json", JSON.stringify(users, null, 2));

app.post("/register", upload.single("photo"), async (req, res) => {
  if (!req.body.password || req.body.password.length < 6) {
    return res
      .status(400)
      .json({ error: "Пароль має бути не менше 6 символів" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    dob: req.body.dob,
    country: req.body.country,
    password: hashedPassword,
    photo: req.file ? `/uploads/${req.file.filename}` : null
  };

  users.push(newUser);
  saveUsers();
  res.status(201).json({ message: "Користувач зареєстрований" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "Користувача не знайдено" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Невірний пароль" });
  }

  res.json({ message: "Вхід успішний", user });
});

app.put("/users/:id/password", async (req, res) => {
  const user = users.find(user => user.id == req.params.id);
  if (!user) return res.sendStatus(404);

  if (!req.body.newPassword || req.body.newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Пароль має бути не менше 6 символів" });
  }

  user.password = await bcrypt.hash(req.body.newPassword, 10);
  saveUsers();
  res.status(200).json({ message: "Пароль оновлено" });
});

// Новий маршрут: оновлення даних користувача
app.put("/users/:id", upload.single("photo"), (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Користувача не знайдено" });
  }

  // Оновлюємо поля, якщо вони передані в запиті
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.dob = req.body.dob || user.dob;
  user.country = req.body.country || user.country;
  if (req.file) {
    user.photo = `/uploads/${req.file.filename}`;
  }

  saveUsers();
  res.status(200).json({ message: "Користувача оновлено", user });
});

// Новий маршрут: видалення користувача
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Користувача не знайдено" });
  }
  users.splice(index, 1);
  saveUsers();
  res.status(200).json({ message: "Користувача видалено" });
});

// Отримання списку користувачів (без паролів)
app.get("/users", (req, res) => {
  res.json(users.map(({ password, ...user }) => user));
});

app.listen(PORT, () =>
  console.log(`Сервер працює на http://localhost:${PORT}`)
);

app.get("/users/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "Користувача не знайдено" });
    }
    // Повернемо дані користувача без поля password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  