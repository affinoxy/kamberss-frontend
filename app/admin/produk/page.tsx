// 'use client'

// import { useState, useEffect } from 'react'

// const API_URL = 'http://localhost:5000/api'

// interface Product {
//   id: number
//   name: string
//   price: number
//   image: string
//   specs: string
//   description: string
//   category: string
// }

// export default function ProdukAdminPage() {
//   const [products, setProducts] = useState<Product[]>([])
//   const [loading, setLoading] = useState(true)
//   const [showModal, setShowModal] = useState(false)
//   const [form, setForm] = useState({
//     name: '',
//     category: 'cameras',
//     price: '',
//     image: '📷',
//     specs: '',
//     description: ''
//   })

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   const fetchProducts = async () => {
//     try {
//       const res = await fetch(`${API_URL}/products`)
//       const data = await res.json()

//       // Flatten the grouped object into a single array
//       const allProducts: Product[] = []
//       Object.keys(data).forEach(key => {
//         if (Array.isArray(data[key])) {
//           allProducts.push(...data[key])
//         }
//       })

//       setProducts(allProducts.sort((a, b) => b.id - a.id))
//       setLoading(false)
//     } catch (err) {
//       console.error(err)
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (id: number) => {
//     if (!confirm('Yakin ingin menghapus produk ini?')) return

//     try {
//       const res = await fetch(`${API_URL}/products/${id}`, {
//         method: 'DELETE'
//       })
//       if (res.ok) {
//         alert('Produk berhasil dihapus')
//         fetchProducts()
//       } else {
//         alert('Gagal menghapus produk')
//       }
//     } catch (err) {
//       console.error(err)
//       alert('Terjadi kesalahan')
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const res = await fetch(`${API_URL}/products`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form)
//       })

//       if (res.ok) {
//         alert('Produk berhasil ditambahkan')
//         setShowModal(false)
//         setForm({
//           name: '',
//           category: 'cameras',
//           price: '',
//           image: '📷',
//           specs: '',
//           description: ''
//         })
//         fetchProducts()
//       } else {
//         alert('Gagal menambahkan produk')
//       }
//     } catch (err) {
//       console.error(err)
//       alert('Terjadi kesalahan')
//     }
//   }

//   if (loading) return <div className="p-6">Loading...</div>

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">📦 Kelola Produk</h1>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           + Tambah Produk
//         </button>
//       </div>

//       <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//         {products.map(product => (
//           <div key={product.id} className="border rounded-xl p-4 shadow bg-white flex flex-col justify-between">
//             <div>
//               {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
//                 <div className="mb-2 h-40 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
//                   <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
//                 </div>
//               ) : (
//                 <div className="text-4xl mb-2">{product.image}</div>
//               )}
//               <h2 className="font-bold text-lg">{product.name}</h2>
//               <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mb-2">
//                 {product.category}
//               </span>
//               <p className="text-blue-600 font-bold">
//                 Rp {product.price.toLocaleString('id-ID')}
//               </p>
//               <p className="text-sm text-gray-500 mt-2">{product.specs}</p>
//             </div>
//             <button
//               onClick={() => handleDelete(product.id)}
//               className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 w-full"
//             >
//               Hapus Produk
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* MODAL TAMBAH PRODUK */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">Tambah Produk Baru</h2>
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <label className="block text-sm font-medium">Nama Produk</label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   className="w-full border p-2 rounded"
//                   value={form.name}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Kategori</label>
//                 <select
//                   name="category"
//                   className="w-full border p-2 rounded"
//                   value={form.category}
//                   onChange={handleInputChange}
//                 >
//                   <option value="cameras">Kamera</option>
//                   <option value="lenses">Lensa</option>
//                   <option value="lighting">Lighting</option>
//                   <option value="gimbals">Gimbal</option>
//                   <option value="packages">Paket</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Harga Sewa (per hari)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   required
//                   className="w-full border p-2 rounded"
//                   value={form.price}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Ikon (Emoji / URL)</label>
//                 <input
//                   type="text"
//                   name="image"
//                   required
//                   className="w-full border p-2 rounded"
//                   value={form.image}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Spesifikasi</label>
//                 <input
//                   type="text"
//                   name="specs"
//                   required
//                   className="w-full border p-2 rounded"
//                   value={form.specs}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Deskripsi</label>
//                 <textarea
//                   name="description"
//                   required
//                   className="w-full border p-2 rounded"
//                   value={form.description}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="flex gap-2 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 bg-gray-200 py-2 rounded"
//                 >
//                   Batal
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 rounded"
//                 >
//                   Simpan
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }