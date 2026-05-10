# Issue: Implement Unit Tests for All APIs

## Objective
Buatkan serangkaian unit test (automated testing) untuk semua API endpoint yang tersedia pada aplikasi ini. Gunakan `bun test` sebagai test runner dan letakkan semua file pengujian di dalam direktori khusus yaitu folder `test/`.

## Requirements (Persyaratan)
1. **Framework:** Gunakan `bun test` bawaan dari Bun.
2. **Lokasi File:** Kumpulkan semua file test di dalam folder `test/` (misalnya: `test/users.test.ts`).
3. **Konsistensi Data (Data Isolation):** Di awal setiap pengujian (menggunakan `beforeEach` atau hook sejenis), Anda **wajib** menghapus/membersihkan data dari database (terutama tabel `users` dan `sessions`). Hal ini penting agar tidak ada tumpang tindih data antar pengujian (menghindari *flakey tests*).
4. **Pendekatan Eksekusi:** Gunakan cara pemanggilan endpoint yang didukung oleh Elysia (misalnya mem-bypass HTTP layer menggunakan `app.handle(new Request(...))` atau menjalankan server *fetch* lokal).

## Skenario Pengujian per API
Pastikan Anda mencakup skenario *Happy Path* (sukses) dan *Negative Path* (gagal) berikut:

### 1. Register API (`POST /api/users`)
- **[Success]** Mendaftar user baru dengan data valid harus mengembalikan HTTP 201 dan data user terkait.
- **[Fail]** Mendaftar dengan payload tidak valid (format email salah, panjang password kurang, atau nama melewati batas) harus mengembalikan HTTP 422/400.
- **[Fail]** Mendaftar dengan email yang sudah ada di database harus mengembalikan HTTP 400.

### 2. Login API (`POST /api/users/login`)
- **[Success]** Login dengan kredensial (email & password) yang terdaftar harus mengembalikan HTTP 200 beserta sesi / Bearer Token.
- **[Fail]** Login dengan email yang belum terdaftar atau kombinasi password yang salah harus mengembalikan HTTP 401.
- **[Fail]** Login dengan payload tidak lengkap atau format salah harus mengembalikan HTTP 422/400.

### 3. Get Current User API (`GET /api/users/current`)
- **[Success]** Mengakses endpoint dengan menyertakan header `Authorization: Bearer <token_valid>` harus mengembalikan HTTP 200 beserta data profil pengguna (tanpa field password).
- **[Fail]** Mengakses tanpa menyertakan token atau menggunakan token sembarang/kedaluwarsa harus mengembalikan HTTP 401.

### 4. Logout API (`DELETE /api/users/logout`)
- **[Success]** Mengakses endpoint dengan `Authorization: Bearer <token_valid>` harus menghapus sesi dari database dan mengembalikan HTTP 200.
- **[Fail]** Mengakses endpoint dengan token yang tidak valid atau mencoba *logout* dua kali menggunakan token yang sama harus mengembalikan HTTP 401.

---
**Catatan untuk Implementer:**
Anda tidak perlu panduan teknis langkah demi langkah secara mendetail. Rancanglah file test dengan rapi menggunakan blok `describe` dan `test`/`it`. Pastikan seluruh skenario di atas berstatus **Passed** saat perintah `bun test` dieksekusi di terminal.
