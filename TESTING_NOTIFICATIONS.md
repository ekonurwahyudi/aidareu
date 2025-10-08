# Testing Notifikasi Orderan - Step by Step

## ❗ MASALAH: Notifikasi Masih Dummy

Jika notifikasi masih menampilkan data dummy (Congratulations Flora, Cecilia Becker, dll), berarti **user_data belum tersimpan di localStorage**.

## ✅ SOLUSI: Set User Data di Browser

### Step 1: Buka Browser Console
- Tekan **F12** atau **Ctrl+Shift+I**
- Pilih tab **Console**

### Step 2: Jalankan Command Berikut

```javascript
// Set user data untuk testing
localStorage.setItem("user_data", JSON.stringify({
  uuid: "3f35a968-ed45-454b-8773-9d57de0b186e",
  name: "Digital Store Owner",
  email: "digital@example.com"
}))

// Verify data tersimpan
console.log('User data:', JSON.parse(localStorage.getItem("user_data")))
```

### Step 3: Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R` atau `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Step 4: Cek Console Log
Setelah refresh, Anda akan melihat log berikut di console:

```
📡 [Notifications] Fetching notifications for user: 3f35a968-ed45-454b-8773-9d57de0b186e
📬 [Notifications] API Response: {success: true, data: [...], unread_count: 3}
✅ [Notifications] Setting 3 notifications
```

### Step 5: Lihat Notifikasi
- 🔔 **Red dot** muncul di notification bell
- Badge **"3 New"** tampil
- Klik bell untuk melihat list notifikasi:
  - New Order #AIDU-071025003
  - New Order #AIDU-071025002
  - New Order #AIDU-071025001

---

## 🔧 Troubleshooting

### Jika Masih Dummy Notifications:

1. **Cek localStorage**
   ```javascript
   console.log(localStorage.getItem("user_data"))
   ```
   Harus return: `{"uuid":"3f35a968-ed45-454b-8773-9d57de0b186e",...}`

2. **Cek Console untuk Error**
   Lihat apakah ada error message dengan prefix `[Notifications]`

3. **Cek Network Tab**
   - Buka tab Network
   - Filter: `notifications/orders`
   - Cek apakah request berhasil (status 200)

4. **Clear Cache & Hard Refresh**
   ```javascript
   // Clear all
   localStorage.clear()

   // Set ulang
   localStorage.setItem("user_data", JSON.stringify({
     uuid: "3f35a968-ed45-454b-8773-9d57de0b186e",
     name: "Digital Store Owner",
     email: "digital@example.com"
   }))
   ```
   Kemudian hard refresh: `Ctrl + Shift + R`

---

## 📊 Test API Langsung

Jika ingin test API secara langsung:

```bash
# Test dari backend
cd /d/aidareu/backend
curl "http://localhost:8000/api/notifications/orders?user_uuid=3f35a968-ed45-454b-8773-9d57de0b186e"
```

Atau buka di browser:
```
http://localhost:8000/api/notifications/orders?user_uuid=3f35a968-ed45-454b-8773-9d57de0b186e
```

---

## 🆕 Create Order Baru untuk Testing

```bash
cd /d/aidareu/backend
php create_test_order.php
```

---

## ℹ️ Catatan

- Notifikasi akan auto-refresh setiap **30 detik**
- Hanya menampilkan order dengan status **"Pending"**
- Order yang sudah "Diproses", "Dikirim", atau "Selesai" tidak muncul sebagai notifikasi baru
- Maksimal **20 notifikasi** terbaru ditampilkan

---

## 📝 Expected Console Logs

**Jika user_data TIDAK ada:**
```
⚠️ [Notifications] No user data found in localStorage, using default notifications
```

**Jika user_data ADA tapi UUID kosong:**
```
⚠️ [Notifications] No user UUID in user data: {name: "...", email: "..."}
```

**Jika SUKSES:**
```
📡 [Notifications] Fetching notifications for user: 3f35a968-ed45-454b-8773-9d57de0b186e
📬 [Notifications] API Response: {success: true, data: Array(3), unread_count: 3}
✅ [Notifications] Setting 3 notifications
```

**Jika TIDAK ada order:**
```
📡 [Notifications] Fetching notifications for user: 3f35a968-ed45-454b-8773-9d57de0b186e
📬 [Notifications] API Response: {success: true, data: [], unread_count: 0}
ℹ️ [Notifications] No new orders found
```
