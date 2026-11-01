CREATE DATABASE IF NOT EXISTS db_keuangan_tugas3;
USE db_keuangan_tugas3;

-- Tabel Kategori (Parent)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('Pemasukan', 'Pengeluaran') NOT NULL
);

-- Tabel Transaksi (Child)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Data Awal (DML)
INSERT INTO categories (name, type) VALUES 
('Gaji Bulanan', 'Pemasukan'),
('Makanan & Minuman', 'Pengeluaran'),
('Transportasi', 'Pengeluaran');

INSERT INTO transactions (category_id, amount, transaction_date, description) VALUES 
(1, 5000000.00, '2026-11-01', 'Gaji awal bulan'),
(2, 50000.00, '2026-11-01', 'Makan siang');