import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export function RegisterForm() {
  const { loading, error, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    register(form.email, form.password, form.confirmPassword, form.name);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
        />
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
