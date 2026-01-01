'use client'

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
  description: string;
  stock?: number;
}

interface Rental {
  id: number;
  name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  total_price?: number;
  status: string;
  return_date?: string;
  return_notes?: string;
  items?: { name: string; price: number }[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRentalForReturn, setSelectedRentalForReturn] = useState<Rental | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRentalForDetail, setSelectedRentalForDetail] = useState<Rental | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    specs: '',
    description: '',
    category: 'cameras',
    stock: ''
  });

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('Silakan login terlebih dahulu');
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(userData);
    if (user.role.toLowerCase() !== 'admin') {
      alert('Akses ditolak! Halaman ini hanya untuk admin.');
      window.location.href = '/';
      return;
    }

    fetchProducts();
    fetchRentals();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      const allProducts: Product[] = [
        ...(data.cameras || []),
        ...(data.lenses || []),
        ...(data.lighting || []),
        ...(data.gimbals || []),
        ...(data.packages || [])
      ];
      setProducts(allProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await fetch(`${API_URL}/rentals`);
      const data = await response.json();
      setRentals(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = (type: string, item: Product | null = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (item && type === 'edit') {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        image: item.image,
        specs: item.specs,
        description: item.description,
        category: item.category,
        stock: item.stock ? item.stock.toString() : ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        image: '',
        specs: '',
        description: '',
        category: 'cameras',
        stock: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Return specific functions
  const openReturnModal = (rental: Rental) => {
    setSelectedRentalForReturn(rental);
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedRentalForReturn(null);
    setReturnNotes('');
  };

  const handleProcessReturn = async () => {
    if (!selectedRentalForReturn) return;

    try {
      const response = await fetch(`${API_URL}/rentals/${selectedRentalForReturn.id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: returnNotes })
      });

      if (response.ok) {
        alert('Pengembalian berhasil diproses!');
        closeReturnModal();
        fetchRentals(); // Refresh list
      } else {
        alert('Gagal memproses pengembalian');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (response.ok) {
        alert('Stok berhasil diupdate!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mengupdate stok');
    }
  };

  const handleUpdateStatus = async (rentalId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/rentals/${rentalId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        alert('Status berhasil diupdate!');
        fetchRentals();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mengupdate status');
    }
  };

  const handleSubmitProduct = () => {
    alert('Fitur simpan akan diimplementasikan dengan API');
    closeModal();
  };

  const openDetailModal = (rental: Rental) => {
    setSelectedRentalForDetail(rental);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRentalForDetail(null);
  };

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  // Filter rentals for Return tab (only 'disetujui')
  const activeRentals = rentals.filter(r => r.status === 'disetujui');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        color: 'white',
        padding: '2rem 0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎥 Admin Dashboard</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Kamberss Kamera - Panel Administrasi</p>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '1rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                // background: activeTab === 'rentals' ? '#dc2626' : 'transparent',
                // color: activeTab === 'rentals' ? 'white' : '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📋 Halaman Utama
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                background: activeTab === 'products' ? '#dc2626' : 'transparent',
                color: activeTab === 'products' ? 'white' : '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📦 Kelola Produk
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              style={{
                background: activeTab === 'rentals' ? '#dc2626' : 'transparent',
                color: activeTab === 'rentals' ? 'white' : '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📋 Kelola Pesanan
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              style={{
                background: activeTab === 'returns' ? '#dc2626' : 'transparent',
                color: activeTab === 'returns' ? 'white' : '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🔄 Pengembalian
            </button>
            <button
              onClick={() => window.location.href = "/admin/users"}
              style={{
                background: activeTab === 'returns' ? '#dc2626' : 'transparent',
                color: activeTab === 'returns' ? 'white' : '#dc2626',
                border: '2px solid #059669',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              👥 Kelola User
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#dc2626' }}>Daftar Produk</h2>
              <button
                onClick={() => openModal('add')}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Tambah Produk
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Produk</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Kategori</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Harga</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Stok</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '2rem' }}>
                            {(product.image.startsWith('http') || product.image.startsWith('/')) ? (
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              product.image
                            )}
                          </span>
                          <div>
                            <div style={{ fontWeight: '600' }}>{product.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{product.specs}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.category}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#dc2626' }}>
                        Rp {product.price?.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input
                          type="number"
                          defaultValue={product.stock || 0}
                          onBlur={(e) => {
                            if (e.target.value !== (product.stock || 0).toString()) {
                              handleUpdateStock(product.id, parseInt(e.target.value));
                            }
                          }}
                          style={{
                            width: '80px',
                            padding: '0.5rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openModal('edit', product)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus produk ini?')) {
                                alert('Fitur hapus akan diimplementasikan');
                              }
                            }}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rentals' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#dc2626', marginBottom: '2rem' }}>Daftar Pesanan Sewa</h2>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Tanggal Sewa</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental, index) => (
                    <tr key={rental.id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>#{rental.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{rental.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rental.email}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rental.phone}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{new Date(rental.start_date).toLocaleDateString('id-ID')}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          s/d {new Date(rental.end_date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#dc2626' }}>
                        Rp {rental.total_price?.toLocaleString('id-ID') || '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={rental.status}
                          onChange={(e) => handleUpdateStatus(rental.id, e.target.value)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '2px solid #e5e7eb',
                            background: rental.status === 'menunggu' ? '#fef3c7' :
                              rental.status === 'disetujui' ? '#d1fae5' :
                                rental.status === 'selesai' ? '#dbeafe' : '#fee2e2',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="menunggu">⏳ Menunggu</option>
                          <option value="disetujui">✅ Disetujui</option>
                          <option value="selesai">✔️ Selesai</option>
                          <option value="pending">⏳ Pending</option>
                          <option value="dibatalkan">❌ Dibatalkan</option>
                          <option value="dikembalikan">🔙 Dikembalikan</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => openDetailModal(rental)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          👁️ Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RETURN TAB CONTENT */}
        {activeTab === 'returns' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#dc2626' }}>
                  Daftar Rental Aktif ({activeRentals.length})
                </h2>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Menampilkan semua rental dengan status "Disetujui" yang siap untuk diproses pengembalian
              </p>
            </div>

            {activeRentals.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Tidak ada rental aktif
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  Semua peralatan sudah dikembalikan atau belum ada yang disetujui
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {activeRentals.map((rental) => (
                  <div
                    key={rental.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      border: '2px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827' }}>
                            Rental #{rental.id}
                          </h3>
                          <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            ✅ Disetujui
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                              👤 Pelanggan
                            </div>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{rental.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rental.email}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rental.phone}</div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                              📅 Periode Sewa
                            </div>
                            <div style={{ fontWeight: '600', color: '#111827' }}>
                              {new Date(rental.start_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              s/d {new Date(rental.end_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '600', marginTop: '0.25rem' }}>
                              Durasi: {calculateDuration(rental.start_date, rental.end_date)} hari
                            </div>
                          </div>
                        </div>

                        {rental.total_price && (
                          <div style={{
                            background: '#fef3c7',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            marginTop: '1rem'
                          }}>
                            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>
                              💰 Total Biaya
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                              Rp {rental.total_price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ marginLeft: '1rem' }}>
                        <button
                          onClick={() => openReturnModal(rental)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                          }}
                        >
                          🔄 Proses Pengembalian
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#dc2626' }}>
                {modalType === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                >
                  <option value="cameras">Kamera</option>
                  <option value="lenses">Lensa</option>
                  <option value="lighting">Lighting</option>
                  <option value="gimbals">Gimbal</option>
                  <option value="packages">Paket</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Harga (per hari)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Stok</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Icon Emoji</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="📷"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Spesifikasi</label>
                <input
                  type="text"
                  name="specs"
                  value={formData.specs}
                  onChange={handleInputChange}
                  placeholder="24MP Full Frame"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <button
                onClick={handleSubmitProduct}
                style={{
                  width: '100%',
                  background: '#dc2626',
                  color: 'white',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                {modalType === 'add' ? '➕ Tambah Produk' : '💾 Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRentalForReturn && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#dc2626' }}>
                🔄 Proses Pengembalian
              </h2>
              <button
                onClick={closeReturnModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Rental #{selectedRentalForReturn.id}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Pelanggan: {selectedRentalForReturn.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Periode: {new Date(selectedRentalForReturn.start_date).toLocaleDateString('id-ID')} - {new Date(selectedRentalForReturn.end_date).toLocaleDateString('id-ID')}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Catatan Pengembalian (Opsional)
              </label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Contoh: Semua peralatan dalam kondisi baik, tidak ada kerusakan"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Catat kondisi peralatan atau catatan penting lainnya
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={closeReturnModal}
                style={{
                  flex: 1,
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleProcessReturn}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                }}
              >
                ✅ Konfirmasi Pengembalian
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {showDetailModal && selectedRentalForDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#1f2937' }}>
                Detail Pesanan #{selectedRentalForDetail.id}
              </h2>
              <button onClick={closeDetailModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem' }}>Informasi Pelanggan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Nama</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Email</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Telepon</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.phone}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem' }}>Item Sewa</h3>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem' }}>
                {selectedRentalForDetail.items && selectedRentalForDetail.items.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedRentalForDetail.items.map((item: any, idx: number) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: idx !== selectedRentalForDetail.items.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: idx !== selectedRentalForDetail.items.length - 1 ? '0.5rem' : 0 }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight: '600', color: '#4b5563' }}>Rp {item.price?.toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#9ca3af' }}>Tidak ada data item</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: '700', fontSize: '1.1rem' }}>
                  <span>Total ({calculateDuration(selectedRentalForDetail.start_date, selectedRentalForDetail.end_date)} hari)</span>
                  <span style={{ color: '#dc2626' }}>Rp {selectedRentalForDetail.total_price?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={closeDetailModal}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRentalForDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#1f2937' }}>
                Detail Pesanan #{selectedRentalForDetail.id}
              </h2>
              <button onClick={closeDetailModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem' }}>Informasi Pelanggan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Nama</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Email</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Telepon</div>
                  <div style={{ fontWeight: '600' }}>{selectedRentalForDetail.phone}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem' }}>Item Sewa</h3>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem' }}>
                {selectedRentalForDetail.items && selectedRentalForDetail.items.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedRentalForDetail.items.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: idx !== (selectedRentalForDetail.items?.length || 0) - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: idx !== (selectedRentalForDetail.items?.length || 0) - 1 ? '0.5rem' : 0 }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight: '600', color: '#4b5563' }}>Rp {item.price?.toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#9ca3af' }}>Tidak ada data item</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: '700', fontSize: '1.1rem' }}>
                  <span>Total ({calculateDuration(selectedRentalForDetail.start_date, selectedRentalForDetail.end_date)} hari)</span>
                  <span style={{ color: '#dc2626' }}>Rp {selectedRentalForDetail.total_price?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={closeDetailModal}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
