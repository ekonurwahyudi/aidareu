// Test product creation with curl - for Windows PowerShell
const data = {
    uuid_store: "test-store-uuid",
    nama_produk: "Test Product",
    deskripsi: "<p>Test product description</p>",
    jenis_produk: "digital",
    url_produk: "https://example.com",
    harga_produk: 100000,
    harga_diskon: 80000,
    category_id: 1,
    status_produk: "active"
};

console.log('Test data for product creation:');
console.log(JSON.stringify(data, null, 2));

console.log('\nCurl command:');
console.log(`curl -X POST "http://127.0.0.1:8000/api/products" ^
  -H "Accept: application/json" ^
  -H "Content-Type: application/json" ^
  -d "${JSON.stringify(data).replace(/"/g, '\\"')}"`);