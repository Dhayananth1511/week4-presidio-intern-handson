import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.email, data.password);
      alert("Account created successfully! You can now login.");
      navigate('/login');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Signup failed!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Join ProTask</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create your secure account</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="name@company.com"
              className={`input-base py-2.5 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
            {errors.email && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`input-base py-2.5 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
            {errors.password && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`input-base py-2.5 ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
            {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="button-primary w-full mt-4">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <span className="opacity-50">Already have an account? </span>
          <Link to="/login" className="text-indigo-600 hover:underline font-bold">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
