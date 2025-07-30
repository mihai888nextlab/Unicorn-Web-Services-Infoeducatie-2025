"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (form.email === "" || form.password === "") {
        setError("Please fill in all fields")
        return
      }
      // Success: redirect or show message
      alert("Logged in successfully!")
    }, 1200)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} />
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
