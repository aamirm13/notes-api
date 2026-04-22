import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const features = [
  "Save important notes instantly",
  "Edit your notes anytime",
  "Delete what you don’t need",
  "Stay organized effortlessly",
  "Access your notes anywhere",
  "Never lose track of ideas",
  "Simple, fast, and secure",
  "Your thoughts, all in one place",
  "Built for focus and productivity",
  "Start writing in seconds",
];

const validatePassword = (password) => {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
};

function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  
  const passwordChecks = validatePassword(form.password);
  const [showPassword, setShowPassword] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ NEW: block if password requirements not met
    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.number) {
      return setError("Password does not meet requirements");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        username: form.username,
        password: form.password,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center rainbow-bg relative overflow-hidden">

      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg bg-white/20 backdrop-blur-xl border border-white/30 p-10 rounded-2xl shadow-2xl flex flex-col gap-6 transition-all duration-300 focus-within:shadow-[0_0_40px_rgba(255,255,255,0.25)] animate-[float_6s_ease-in-out_infinite]"
      >
        <div className="text-center space-y-1 text-white">
          <h2 className="text-3xl font-semibold tracking-tight">
            Create account
          </h2>
          <p className="text-sm opacity-90">
            Start your notes journey
          </p>
        </div>

        {/* USERNAME */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-white/90">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="px-3 py-3 rounded-lg bg-white/30 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
            placeholder="Enter username"
          />
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-white/90">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 rounded-lg bg-white/30 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-sm text-white/70 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* ✅ NEW: PASSWORD REQUIREMENTS UI */}
          <div className="mt-2 text-xs space-y-1">
            <p className={passwordChecks.length ? "text-green-300" : "text-white/60"}>
              • At least 6 characters
            </p>
            <p className={passwordChecks.uppercase ? "text-green-300" : "text-white/60"}>
              • One uppercase letter
            </p>
            <p className={passwordChecks.number ? "text-green-300" : "text-white/60"}>
              • One number
            </p>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-white/90">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="px-3 py-3 rounded-lg bg-white/30 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
            placeholder="Repeat password"
          />
        </div>

        {error && (
          <p className="text-red-200 text-sm text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-white text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 active:scale-95 transition-all duration-150"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-center text-white/80">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer underline hover:text-white"
          >
            Sign in
          </span>
        </p>
      </form>

      {/* SLIDESHOW */}
      <div className="relative z-10 mt-10 w-full max-w-md overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${featureIndex * 100}%)`,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 text-white text-center"
            >
              <p className="text-lg font-medium">
                {feature}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {features.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === featureIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default Register;