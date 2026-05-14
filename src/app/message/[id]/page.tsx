"use client"
import React from 'react'
import MessagePanel from '../../chat'
import { useParams } from 'next/navigation'

const page = () => {
  const params = useParams()
  return (
    <div><MessagePanel targetUserId={params.userId as string} /></div>
  )
}

export default page