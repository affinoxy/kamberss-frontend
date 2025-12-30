'use client'

import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import Link from 'next/link'
// const API_URL = 'http://localhost:5000/api'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Product {
  id: number
  name: string
  price: number
  image: string
  specs: string
  description: string
}

interface CartItem extends Product {
  category: string
}

interface Products {
  cameras?: Product[]
  lenses?: Product[]
  actioncam?: Product[]
  lighting?: Product[]
  gimbals?: Product[]
  packages?: Product[]
}

export default function Home() {
  const [products, setProducts] = useState<Products>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchProducts()
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`)
      const data = await response.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }
  // const fetchProducts = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/products`)
  //     if (!response.ok) throw new Error('Fetch gagal')
  //     const data = await response.json()
  //     setProducts(data)
  //   } catch (error) {
  //     console.error(error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  const addToCart = (product: Product, category: string) => {
    setCart([...cart, { ...product, category }])
    alert('Item berhasil ditambahkan ke keranjang!')
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const calculateTotal = () => {
    const days = calculateDays()
    return cart.reduce((sum, item) => sum + item.price * days, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 1

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 1
  }


  const submitRental = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return
    }

    try {
      // Step 1: Create rental in database
      const rentalResponse = await fetch(`${API_URL}/rental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: cart
        })
      })

      const rentalData = await rentalResponse.json()

      if (!rentalData.success) {
        alert('Gagal membuat pesanan')
        return
      }

      // Step 2: Create payment transaction
      const days = calculateDays()

      const paymentResponse = await fetch(`${API_URL}/payment/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rentalId: rentalData.rentalId,
          customerDetails: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price * days
          })),
          totalAmount: calculateTotal()
        })
      })



      const paymentData = await paymentResponse.json()

      if (!paymentData.success) {
        alert('Gagal membuat transaksi pembayaran')
        return
      }

      // Step 3: Open Midtrans Snap payment popup
      // @ts-ignore - Midtrans Snap is loaded from external script
      window.snap.pay(paymentData.snap_token, {
        onSuccess: function (result: any) {
          console.log('Payment success:', result)
          alert('Pembayaran berhasil! Pesanan Anda sedang diproses.')
          setCart([])
          setShowCart(false)
          setFormData({
            name: '',
            email: '',
            phone: '',
            startDate: '',
            endDate: ''
          })
        },
        onPending: function (result: any) {
          console.log('Payment pending:', result)
          alert('Pembayaran menunggu. Silakan selesaikan pembayaran Anda.')
          setShowCart(false)
        },
        onError: function (result: any) {
          console.log('Payment error:', result)
          alert('Pembayaran gagal. Silakan coba lagi.')
        },
        onClose: function () {
          console.log('Payment popup closed')
          alert('Anda menutup popup pembayaran. Silakan selesaikan pembayaran untuk melanjutkan.')
        }
      })

    } catch (error) {
      console.error('Error submitting rental:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    alert('Logout berhasil!')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      <div className="header">
        <div className="container">
          <h1>Kamberss Kamera</h1>
          <p>Sewa Peralatan Kamera Profesional</p>
        </div>
      </div>


      <div className="nav">
        <div className="container">
          <div className="nav-content">
            <span className="nav-link" onClick={() => scrollToSection('cameras')}>Kamera</span>
            <span className="nav-link" onClick={() => scrollToSection('lenses')}>Lensa</span>
            <span className="nav-link" onClick={() => scrollToSection('actioncams')}>Action Cam</span>
            <span className="nav-link" onClick={() => scrollToSection('lighting')}>Lighting</span>
            <span className="nav-link" onClick={() => scrollToSection('gimbals')}>Gimbal</span>
            <span className="nav-link" onClick={() => scrollToSection('packages')}>Paket</span>

            {/* Admin Panel button - only show if user is admin */}
            {user && user.role.toLowerCase() === 'admin' && (
              <button className="admin-btn" onClick={() => window.location.href = "/admin"}>
                ⚙️ Admin Panel
              </button>
            )}

            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒 Keranjang ({cart.length})
            </button>
            {user ? (
              <>
                <span style={{ marginLeft: 'auto', color: '#dc2626', fontWeight: '600' }}>
                  👤 {user.name}
                </span>
                <button className="login-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="login-btn" onClick={() => window.location.href = "/login"}>Login</button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div id="cameras" className="section">
          <h2 className="section-title">Kamera</h2>
          <div className="products-grid">
            {products.cameras?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'cameras')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id="lenses" className="section">
          <h2 className="section-title">Lensa</h2>
          <div className="products-grid">
            {products.lenses?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'lenses')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id="actioncams" className="section">
          <h2 className="section-title">Action Camera</h2>
          <div className="products-grid">
            {products.actioncam?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'actioncam')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id="lighting" className="section">
          <h2 className="section-title">Lighting</h2>
          <div className="products-grid">
            {products.lighting?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'lighting')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id="gimbals" className="section">
          <h2 className="section-title">Gimbal</h2>
          <div className="products-grid">
            {products.gimbals?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'gimbals')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id="packages" className="section">
          <h2 className="section-title">Paket Spesial</h2>
          <div className="products-grid">
            {products.packages?.map(product => (
              <div key={product.id} className="product-card">
                {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  <div className="mb-4 h-48 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="product-icon">{product.image}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-specs">{product.specs}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">
                  Rp {product.price.toLocaleString('id-ID')}
                  <small>/hari</small>
                </div>
                <button
                  className="rent-btn"
                  onClick={() => addToCart(product, 'packages')}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`modal ${showCart ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Keranjang Sewa</h2>
            <button className="close-btn" onClick={() => setShowCart(false)}>✕</button>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">Keranjang kosong</div>
          ) : (
            <>
              <div>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <strong>{item.name}</strong><br />
                      <small>Rp {item.price.toLocaleString('id-ID')}/hari</small>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>

              <div className="total">
                Total ({calculateDays()} hari): Rp {calculateTotal().toLocaleString('id-ID')}
              </div>

              <form onSubmit={submitRental}>
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Mulai</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Selesai</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit" className="checkout-btn">
                  Konfirmasi Sewa
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="footer">
        <div className="container">
          <p>&copy; 2024 Kamberss Kamera. All rights reserved.</p>
          <p>📞 Contact: +62 812-3456-7890 | 📧 info@kambersSkamera.com</p>
        </div>
      </div>
    </>
  )
}