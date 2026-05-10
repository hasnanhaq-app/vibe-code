# Standar Tahapan Pengembangan Fitur (Vibe Coding Workflow)

Dokumen ini berisi ringkasan alur kerja (workflow) iteratif yang selalu kita lakukan setiap kali mengembangkan fitur baru pada proyek `vibe-code`. Mengikuti panduan ini akan memastikan kode tetap rapi, minim bug, dan terdokumentasi dengan baik.

---

## 1. Perencanaan & Dokumentasi (Issue Tracking)
Sebelum menulis baris kode apa pun, fitur harus direncanakan terlebih dahulu.
*   **Drafting Plan:** Buat file perencanaan di folder `src/prompt/` dengan format penamaan `issue[N].md` (contoh: `issue6.md`).
*   **Isi Dokumen:** File ini harus memuat secara detail:
    *   Tujuan fitur.
    *   Spesifikasi Endpoint (Method & URL).
    *   Kebutuhan Headers / Body Request.
    *   Ekspektasi Response Success (beserta format JSON dan HTTP Status).
    *   Ekspektasi Response Error (beserta format JSON dan HTTP Status).
    *   Daftar langkah pengerjaan (Step-by-step).
*   **GitHub Issue:** Jadikan file tersebut sebagai Issue baru di GitHub (bisa menggunakan GitHub CLI: `gh issue create --title "Nama Fitur" --body-file src/prompt/issue[N].md`).

## 2. Persiapan Branch (Version Control)
*   **Sync dengan Origin:** Selalu kembali ke branch `main` dan tarik perubahan terbaru (`git checkout main`, lalu `git pull origin main`).
*   **Feature Branch:** Buat branch baru yang spesifik untuk fitur tersebut dengan prefix `feature/` (contoh: `git checkout -b feature/reset-password`).
*   **Task Management:** Buat `task.md` secara lokal (sebagai artefak) untuk mencatat checklist pekerjaan agar terorganisir.

## 3. Pekerjaan Database (Jika Ada Perubahan Skema)
*   **Update Schema:** Modifikasi file `src/db/schema.ts` untuk menambah tabel atau kolom baru.
*   **Generate & Push Migration:** Jalankan perintah Drizzle ORM untuk meng-generate dan me-push perubahan skema ke database MySQL (misal menggunakan `bun run generate` / `bun run migrate` / `drizzle-kit push`).

## 4. Pengembangan Kode (Implementation)
Pemisahan *layer* sangat penting agar kode mudah di-*maintain*.
*   **Middleware (`src/middleware/`):** (Opsional) Buat atau update custom plugin Elysia jika fitur memerlukan validasi *cross-cutting* seperti autentikasi token.
*   **Services Layer (`src/services/`):** Tulis logika bisnis murni di sini (query ke database, hashing, validasi kompleks, dsb.). Fungsi di sini harus me-return data mentah atau melempar (`throw`) Error dengan kode spesifik.
*   **Routes Layer (`src/routes/`):** Daftarkan endpoint Elysia, tentukan validasi *payload* (dengan TypeBox / `t`), panggil service yang sesuai, dan format response ke pengguna (termasuk menangani blok `try...catch` untuk *formatting error*).

## 5. Pengujian & Verifikasi (Testing)
*   **Jalankan Server:** Gunakan mode watch (`bun run --watch src/index.ts`).
*   **API Testing:** Uji endpoint secara langsung (bisa menggunakan `curl`, Postman, atau file JSON sementara).
*   **Validasi Kasus:** Uji *Happy Path* (sukses) dan seluruh *Negative Path* (error/gagal) sesuai yang disepakati di file `issue[N].md`.
*   **Side-effect Check:** Pastikan perubahan tidak merusak endpoint lain (misalnya setelah logout, pastikan endpoint `/current` mengembalikan status 401).

## 6. Code Review & Refactoring
*   **Self-Review:** Periksa ulang apakah kode melanggar prinsip DRY (*Don't Repeat Yourself*). Jika ada repetisi (seperti ekstraksi token), pindahkan ke middleware.
*   **Optimasi:** Pastikan query database sudah efisien (contoh: gunakan *affected rows* dari aksi `delete` daripada melakukan `findFirst` terlebih dahulu, jika memungkinkan).

## 7. Finalisasi & Integrasi GitHub
*   **Commit:** *Stage* dan *Commit* perubahan dengan pesan yang deskriptif (contoh: `feat: implement user logout api`).
*   **Push Branch:** Unggah branch ke repository (`git push -u origin feature/[nama-fitur]`).
*   **Pull Request:** Buat Pull Request (PR) ke `main` (menggunakan `gh pr create`).
*   **Merge & Cleanup:** Setelah dirasa aman, *Merge* PR ke `main` dan hapus branch fitur tersebut agar repositori tetap bersih (`gh pr merge --merge --delete-branch`).

---
*Catatan ini akan terus diperbarui jika kita menemukan metode atau standar baru selama masa pengembangan vibe-code.*
