# Issue: Add Input Validation to Prevent Database Overflow Errors

## Objective
Memperbaiki bug di mana pendaftaran pengguna (registrasi) dengan field `name` yang melebihi 255 karakter menyebabkan aplikasi melempar error `500 Internal Server Error`. API harus menolak input yang tidak valid sejak awal (sebelum menyentuh database) dan mengembalikan HTTP error yang tepat (seperti `422 Unprocessable Entity` atau `400 Bad Request`).

## Background / Context
Saat ini, endpoint `/api/users` menerima tipe `String` apa saja untuk `name`, `email`, dan `password` tanpa batasan panjang. Di sisi database, skema kita membatasi kolom tersebut maksimal `VARCHAR(255)`. Jika user mengirim data lebih panjang dari itu, Drizzle ORM / MySQL akan error, dan aplikasi menganggapnya sebagai "Internal Server Error". Kita harus memvalidasi payload request agar lebih kokoh (*robust*).

## File Target
- `src/routes/users-route.ts`

## Step-by-Step Implementation Guide
(Petunjuk pengerjaan untuk Junior Programmer / AI Model)

Ikuti langkah-langkah berikut secara berurutan:

### Step 1: Tambahkan Validasi TypeBox di Route Register
1. Buka file `src/routes/users-route.ts`.
2. Cari rute `POST /` (endpoint untuk registrasi).
3. Perhatikan di bagian akhir fungsi rute tersebut, terdapat blok validasi `body` menggunakan `t.Object(...)`.
4. Ubah tipe data di dalam `t.Object` tersebut dengan menambahkan *constraints* (batasan) berikut:
   - `name`: Ubah menjadi `t.String({ maxLength: 255 })`
   - `email`: Ubah menjadi `t.String({ format: 'email', maxLength: 255 })`
   - `password`: Ubah menjadi `t.String({ minLength: 6, maxLength: 255 })`

### Step 2: Tambahkan Validasi TypeBox di Route Login (Best Practice)
1. Masih di file yang sama, cari rute `POST /login`.
2. Update juga blok validasi `body` untuk rute login:
   - `email`: Ubah menjadi `t.String({ format: 'email' })`
   - `password`: Biarkan `t.String()` (hanya sekadar string, karena validasi utama ada di register, namun memastikan input bertipe string).

### Step 3: Pengujian (Testing)
1. Jalankan development server (`bun run dev` atau `bun run --watch src/index.ts`).
2. Uji rute `POST /api/users` menggunakan `curl` atau file JSON. Lakukan skenario berikut:
   - **Test 1 (Name terlalu panjang):** Kirim payload dengan `name` sepanjang 300 huruf. 
     *Ekspektasi:* Response harus HTTP Status 422/400 (bukan 500), yang memberitahu bahwa panjang maksimal terlampaui.
   - **Test 2 (Email invalid):** Kirim payload dengan `email` yang formatnya salah (contoh: "bukan_email"). 
     *Ekspektasi:* Response harus HTTP Status 422/400.
   - **Test 3 (Password terlalu pendek):** Kirim payload dengan `password` sepanjang 3 huruf. 
     *Ekspektasi:* Response harus HTTP Status 422/400.
   - **Test 4 (Sukses Path):** Kirim payload valid.
     *Ekspektasi:* Response harus HTTP Status 201.

---
**Catatan untuk Implementer:** 
ElysiaJS menggunakan TypeBox untuk validasi skema. Ketika Anda menambahkan batasan seperti `{ maxLength: 255 }`, Elysia akan mencegat request yang tidak sesuai secara otomatis di *layer route* sebelum kode masuk ke blok `try...catch` dan melakukan *query* ke database. Anda tidak perlu membuat if-else manual untuk mengecek panjang string.
