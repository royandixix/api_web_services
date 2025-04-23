const express = require("express");
const db = require("./db"); // import koneksi
const app = express();
const port = 3000;

app.use(express.json());

// GET semua user
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET user by ID
app.get("/users/:id", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json(result[0]);
    }
  );
});

// POST user baru
app.post("/users", (req, res) => {
  const { nama, email } = req.body;
  db.query(
    "INSERT INTO users (nama, email) VALUES (?, ?)",
    [nama, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, nama, email });
    }
  );
});

// PUT user
app.put("/users/:id", (req, res) => {
  const { nama, email } = req.body;
  db.query(
    "UPDATE users SET nama = ?, email = ? WHERE id = ?",
    [nama, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User berhasil diperbarui" });
    }
  );
});

// PATCH user
app.patch("/users/:id", (req, res) => {
  const { nama, email } = req.body;
  db.query(
    "UPDATE users SET nama = COALESCE(?, nama), email = COALESCE(?, email) WHERE id = ?",
    [nama, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User berhasil diupdate sebagian" });
    }
  );
});

// DELETE user
app.delete("/users/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User berhasil dihapus" });
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
