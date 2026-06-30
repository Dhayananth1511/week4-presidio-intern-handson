import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/tasks');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Login failed!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Secure Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest opacity-60 ml-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="name@company.com"
              className={`input-base ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
            {errors.email && <span className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest opacity-60 ml-1">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`input-base ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
            {errors.password && <span className="text-xs text-red-500 font-bold ml-1">{errors.password.message}</span>}
          </div>

          <button type="submit" className="button-primary w-full mt-4">
            Sign In Now
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <span className="opacity-50">Don't have an account? </span>
          <Link to="/signup" className="text-indigo-600 hover:underline font-bold">Create one here</Link>
        </div>

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-2">
            🛡️ XSS-PROOF SECURITY
          </p>
          <p className="text-[11px] leading-relaxed opacity-80 italic">
            This app uses HttpOnly Cookies. Tokens are stored in a secure browser vault that JavaScript cannot touch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
