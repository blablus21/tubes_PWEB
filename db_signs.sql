-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 17 Jun 2023 pada 18.13
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_signs`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `documents`
--

INSERT INTO `documents` (`document_id`, `user_id`, `name`, `filename`, `description`, `created_at`, `updated_at`) VALUES
(4, 1, 'data bem', '1686576970065-data.csv', 'ttd cuy', '2023-06-12 13:36:10.072807', '2023-06-12 13:36:10.072807'),
(5, 2, 'Data penjualan', '1686578382259-Salary_dataset.csv', 'ttd nisa', '2023-06-12 13:59:42.264885', '2023-06-12 13:59:42.264885'),
(7, 3, 'tes', '1687006575633-tes.pdf', 'tes', '2023-06-17 12:56:15.653413', '2023-06-17 12:56:15.653413');

-- --------------------------------------------------------

--
-- Struktur dari tabel `signature`
--

CREATE TABLE `signature` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `signed_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `signature`
--

INSERT INTO `signature` (`id`, `user_id`, `document_id`, `jabatan`, `status`, `signed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'sekretaris', 'aktif', '2023-06-12 13:36:10.076806', '2023-06-12 13:36:10.076806', '2023-06-12 13:36:10.076806'),
(2, 2, 5, 'Tim creative', 'aktif', '2023-06-12 13:59:42.268906', '2023-06-12 13:59:42.268906', '2023-06-12 13:59:42.268906');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active` int(10) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `sign_img` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `active`, `avatar`, `sign_img`, `created_at`, `updated_at`) VALUES
(1, 'tiara', 'tiara@gmail.com', '$2b$10$XK0H4YnSw5q/YwfzCrQtqee0yOn8DW5Cwx9oBYbr8d8rM528OyRQu', 0, '1686576624888-3.jpg', '', '2023-06-12 13:22:10.570394', '2023-06-12 13:22:10.570394'),
(2, 'nisa', 'nisa@gmail.com', '$2b$10$7a1Sg7jXkQWWFgLqJ8.MF.HX1WEkYY2BBPmH/T0FolGvXraFV0rTW', 0, '', '', '2023-06-12 13:31:33.705477', '2023-06-12 13:31:33.705477'),
(3, 'tes', 'tes@gmail.com', '$2b$10$qnL6yIIlaC6XQplJqPQIZ.ZzrX9VkjNO4Tn8Vn18miXRddar8AXLS', 0, '', '1687006702607-signature (6).png', '2023-06-17 12:19:03.697058', '2023-06-17 12:19:03.697058');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `signature`
--
ALTER TABLE `signature`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `document_id` (`document_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `signature`
--
ALTER TABLE `signature`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Ketidakleluasaan untuk tabel `signature`
--
ALTER TABLE `signature`
  ADD CONSTRAINT `signature_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `signature_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
