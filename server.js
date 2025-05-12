// server.js
const express = require("express");
const db = require("./db");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET semua user
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET multiple user berdasarkan id (dipisah koma)
app.get("/users/multi/:ids", (req, res) => {
  const ids = req.params.ids.split(",").map(id => parseInt(id));
  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT * FROM users WHERE id IN (${placeholders})`;

  db.query(sql, ids, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET satu user by ID
app.get("/users/:id", (req, res) => {
  db.query("SELECT * FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(result[0]);
  });
});

// POST user baru dengan ID otomatis + urut
app.post("/users", (req, res) => {
  const { nama, email } = req.body;
  db.query("SELECT IFNULL(MAX(id), 0) AS maxId FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const nextId = rows[0].maxId + 1;
    db.query("INSERT INTO users (id, nama, email) VALUES (?, ?, ?)", [nextId, nama, email], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json({ id: nextId, nama, email });
    });
  });
});

// PUT user by ID
app.put("/users/:id", (req, res) => {
  const { nama, email } = req.body;

  if (!nama || !email) {
    return res.status(400).json({ error: "Nama dan email wajib diisi" });
  }

  db.query("UPDATE users SET nama = ?, email = ? WHERE id = ?", [nama, email, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "User berhasil diperbarui" });
  });
});

// PATCH user sebagian (partial update)
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

// DELETE user dan reset ID agar tetap urut
app.delete("/users/:id", (req, res) => {
  const idToDelete = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [idToDelete], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    db.query("SET @count = 0", (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      db.query("UPDATE users SET id = (@count := @count + 1)", (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });

        res.json({ message: "User berhasil dihapus dan ID dirapikan" });
      });
    });
  });
});

// HEAD method
app.head("/users", (req, res) => {
  db.query("SELECT * FROM users", (err) => {
    if (err) return res.status(500).end();
    res.status(200).end();
  });
});

// OPTIONS method
app.options("/users", (req, res) => {
  res.set("ALLOW", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
  res.sendStatus(204);
});

// Mulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
