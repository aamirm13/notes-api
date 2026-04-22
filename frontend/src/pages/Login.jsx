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

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);

  const navigate = useNavigate();

  //  slideshow effect
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
    setLoading(true);

    try {
      await api.post("/auth/login", form);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex flex-col items-center justify-center rainbow-bg relative overflow-hidden">

    {/*  Soft overlay for readability */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/*  LOGIN CARD */}
    <form
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-2xl shadow-2xl flex flex-col gap-5 transition-all duration-300 focus-within:shadow-[0_0_40px_rgba(255,255,255,0.25)] animate-[float_6s_ease-in-out_infinite]"
    >
      <div className="text-center space-y-1 text-white">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm opacity-90">
          Sign in to your account
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-white/90">Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
          placeholder="Enter username"
        />
      </div>

      <div className="flex flex-col gap-1">
  <label className="text-sm text-white/90">Password</label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={form.password}
      onChange={handleChange}
      required
      className="w-full px-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
      placeholder="••••••••"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-2.5 text-sm text-white/70 hover:text-white transition"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>

      {error && (
        <p className="text-red-200 text-sm text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-white text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-200 active:scale-95 transition-all duration-150"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-center text-white/80">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="cursor-pointer underline hover:text-white"
        >
          Create one
        </span>
      </p>
    </form>

    {/* SLIDESHOW BELOW */}
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

  {/* Dots */}
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

export default Login;