# Klokapp Bot

## Cara Menjalankan Klokapp Bot 

### 1. **Clone Repository**
Jalankan perintah berikut untuk mengunduh kode dari GitHub:
```sh
git clone https://github.com/Arapemula/Klokapp_bot.git
cd Klokapp_bot
```

### 2. **Install Dependensi**
Pastikan `Node.js` sudah terinstal di VPS, lalu jalankan:
```sh
npm install
```

### 3. **Konfigurasi Session Token & Wallet Address**
Ganti `sessionToken` dan `WALLET_ADDRESS` dengan data yang benar:
```sh
sed -i 's/"sessionToken": "isi disini"/"sessionToken": "masukan_kesini"/' session.json
sed -i 's/WALLET_ADDRESS=isi disini/WALLET_ADDRESS=ganti_ini/' .env
```

> **Catatan:** Jika menggunakan macOS, gunakan:
> ```sh
> sed -i '' 's/"sessionToken": "isi disini"/"sessionToken": "masukan_kesini"/' session.json
> sed -i '' 's/WALLET_ADDRESS=isi disini/WALLET_ADDRESS=ganti_ini/' .env
> ```

### 4. **Menjalankan Bot**
Jalankan bot dengan perintah:
```sh
node main.js
```

Jika ingin menjalankan bot di background menggunakan `pm2`:
```sh
npm install -g pm2
pm2 start main.js --name klokapp-bot
pm2 save
pm2 startup
```

### 5. **Cek Status Bot**
Untuk melihat status bot yang berjalan di `pm2`, jalankan:
```sh
pm2 list
```

Untuk melihat log bot:
```sh
pm2 logs klokapp-bot
```

### 6. **Menghentikan Bot**
Jika perlu menghentikan bot:
```sh
pm2 stop klokapp-bot
```

Jika ingin menghapus bot dari `pm2`:
```sh
pm2 delete klokapp-bot
```

---
**Sekarang bot sudah berjalan! 🚀**

