'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import axiosInstance from '@/app/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await axiosInstance.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      })
      return response.data
    },
    onSuccess: () => {
      router.push('/mycontacts')
    },
    onError: (error: any) => {
      console.error('Registration failed:', error.response?.data?.message || error.message)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = registerSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}
      Object.keys(fieldErrors).forEach((key) => {
        newErrors[key as keyof RegisterFormData] = fieldErrors[key as keyof RegisterFormData]?.[0]
      })
      setErrors(newErrors)
      return
    }

    registerMutation.mutate(result.data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Create Account</h1>

        {registerMutation.isError && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {registerMutation.error?.response?.data?.message || 'Registration failed'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="johndoe"
          />
          {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {registerMutation.isPending ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register