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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchProducts()
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
    return cart.reduce((sum, item) => sum + item.price, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const submitRental = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return
    }

    try {
      const response = await fetch(`${API_URL}/rental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: cart
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Pesanan berhasil! Kami akan menghubungi Anda segera.')
        setCart([])
        setShowCart(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          startDate: '',
          endDate: ''
        })
      }
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

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      <div className="header">
        <div className="container">
          <h1>🎥 Kamberss Kamera</h1>
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
            {/* <Link href="/admin">
              <button className="admin-btn">⚙️ Admin Panel</button>
            </Link> */}
            <button className="admin-btn" onClick={() => window.location.href = "/admin"}>⚙️ Admin Panel</button>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒 Keranjang ({cart.length})
            </button>
            <button className="login-btn" onClick={() => window.location.href = "/login"}>Login</button>
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
                Total: Rp {calculateTotal().toLocaleString('id-ID')}/hari
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