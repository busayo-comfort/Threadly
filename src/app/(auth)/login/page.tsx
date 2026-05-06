'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axiosInstance from '@/app/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await axiosInstance.post('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('userId', data.user._id)
      router.push('/mycontacts')
    },
    onError: (error: any) => {
      console.error('Login failed:', error.response?.data?.message || error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>

        {loginMutation.isError && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {loginMutation.error?.response?.data?.message || 'Login failed'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login