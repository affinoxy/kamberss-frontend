'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                // Save user info to localStorage (Simple imitation of auth session)
                localStorage.setItem('user', JSON.stringify(data.user))
                alert(`Login berhasil! Selamat datang, ${data.user.name}`)

                if (data.user.role === 'ADMIN') {//sesuaikan dengan database (besar kecilnya)
                    router.push('/admin')
                } else {
                    router.push('/')
                }
            } else {
                alert(data.error || 'Login gagal')
            }
        } catch (err) {
            console.error(err)
            alert('Terjadi kesalahan sistem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600">🎥 Kamberss Login</h1>
                    <p className="text-gray-500 mt-2">Masuk untuk mulai menyewa</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-red-600 font-semibold hover:underline">
                        Daftar di sini
                    </Link>
                </div>
            </div>
        </div>
    )
}
