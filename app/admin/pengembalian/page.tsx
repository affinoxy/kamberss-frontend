'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = 'http://localhost:5000/api'

interface RentalItem {
    id: number
    product_id: number
    price: number
}

interface Rental {
    id: number
    name: string
    email: string
    phone: string
    start_date: string
    end_date: string
    status: string
    total_price?: number
    items?: RentalItem[]
    return_date?: string
    return_notes?: string
}

export default function PengembalianPage() {
    const [rentals, setRentals] = useState<Rental[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
    const [returnNotes, setReturnNotes] = useState('')

    useEffect(() => {
        fetchActiveRentals()
    }, [])

    const fetchActiveRentals = async () => {
        try {
            const response = await fetch(`${API_URL}/rentals`)
            const data = await response.json()
            // Filter only active rentals (disetujui status)
            const activeRentals = data.filter((r: Rental) => r.status === 'disetujui')
            setRentals(activeRentals)
            setLoading(false)
        } catch (error) {
            console.error('Error:', error)
            setLoading(false)
        }
    }

    const openReturnModal = (rental: Rental) => {
        setSelectedRental(rental)
        setReturnNotes('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedRental(null)
        setReturnNotes('')
    }

    const handleProcessReturn = async () => {
        if (!selectedRental) return

        try {
            const response = await fetch(`${API_URL}/rentals/${selectedRental.id}/return`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: returnNotes })
            })

            if (response.ok) {
                alert('Pengembalian berhasil diproses!')
                closeModal()
                fetchActiveRentals()
            } else {
                alert('Gagal memproses pengembalian')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Terjadi kesalahan')
        }
    }

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    if (loading) {
        return <div className="loading">Memuat data...</div>
    }

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
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄 Pengembalian Kamera</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Kelola pengembalian peralatan dari pelanggan</p>
                </div>
            </div>

            {/* Navigation */}
            <div style={{
                background: 'white',
                padding: '1rem 0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <Link href="/admin">
                        <button style={{
                            background: 'transparent',
                            color: '#dc2626',
                            border: '2px solid #dc2626',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            ← Kembali ke Dashboard
                        </button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#dc2626' }}>
                            Daftar Rental Aktif ({rentals.length})
                        </h2>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Menampilkan semua rental dengan status "Disetujui" yang siap untuk diproses pengembalian
                    </p>
                </div>

                {rentals.length === 0 ? (
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
                        {rentals.map((rental) => (
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

            {/* Return Modal */}
            {showModal && selectedRental && (
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
                                onClick={closeModal}
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
                                Rental #{selectedRental.id}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Pelanggan: {selectedRental.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Periode: {new Date(selectedRental.start_date).toLocaleDateString('id-ID')} - {new Date(selectedRental.end_date).toLocaleDateString('id-ID')}
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
                                onClick={closeModal}
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
        </div>
    )
}
