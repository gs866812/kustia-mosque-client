import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react"; // Eye icon
import { toast } from "react-hot-toast";
import { auth } from "../../../firebase";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // **************************************************************************************************************
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  // ***************************************************************************************************************
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate(from, { replace: true }); // ✅ redirect to original route
    } catch (error) {
      toast.error("ইমেইল বা পাসওয়ার্ড ভুল!");
      console.error(error);
    }
  };
  // **************************************************************************************************************
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-sm p-6 rounded-lg border shadow bg-white">
        <h2 className="text-2xl font-bold text-center mb-4">লগইন করুন</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>

            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="example@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pr-10"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute top-3 right-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn localBG text-white  w-full">
            লগইন
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
