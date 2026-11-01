const express = require('express');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// 1. READ: Menampilkan daftar transaksi, kategori, & Total Saldo Real-time
app.get('/', async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT T.id, T.amount, T.transaction_date, T.description, C.name AS category_name, C.type
            FROM transactions T
            JOIN categories C ON T.category_id = C.id
            ORDER BY T.transaction_date DESC
        `);
        
        const [categoriesRows] = await pool.query('SELECT * FROM categories');
        const categories = categoriesRows;

        // Menghitung Saldo Aktif Real-time (Total Pemasukan dikurangi Total Pengeluaran)
        let totalSaldo = 0;
        transactions.forEach(t => {
            const nominal = Number(t.amount);
            if (t.type === 'Pemasukan') {
                totalSaldo += nominal;
            } else if (t.type === 'Pengeluaran') {
                totalSaldo -= nominal;
            }
        });

        // Kirim data transactions, categories, dan totalSaldo ke views/index.ejs
        res.render('index', { transactions, categories, totalSaldo });
    } catch (err) {
        console.error(err);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

// 2. CREATE: Menambah transaksi baru (Menggunakan Prepared Statements)
app.post('/add', async (req, res) => {
    try {
        const { category_id, amount, transaction_date, description } = req.body;
        await pool.execute(
            'INSERT INTO transactions (category_id, amount, transaction_date, description) VALUES (?, ?, ?, ?)',
            [category_id, amount, transaction_date, description]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal menambah data transaksi");
    }
});

// 3. UPDATE (Form Edit): Mengambil data transaksi berdasarkan ID
app.get('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
        const [categoriesRows] = await pool.query('SELECT * FROM categories');
        const categories = categoriesRows;
        
        if (rows.length === 0) return res.status(404).send("Data tidak ditemukan");
        res.render('edit', { transaction: rows[0], categories });
    } catch (err) {
        console.error(err);
        res.status(500).send("Kesalahan server");
    }
});

// 3. UPDATE (Proses Update Data)
app.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, amount, transaction_date, description } = req.body;
        await pool.execute(
            'UPDATE transactions SET category_id = ?, amount = ?, transaction_date = ?, description = ? WHERE id = ?',
            [category_id, amount, transaction_date, description, id]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal memperbarui data");
    }
});

// 4. DELETE: Menghapus data transaksi berdasarkan ID
app.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM transactions WHERE id = ?', [id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal menghapus data");
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});