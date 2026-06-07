import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUser, FiMail, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
              <FiUser size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Profile</h1>
              <p className="text-white/70 text-sm mt-0.5">Manage your personal information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input {...register('name')} className="input-field pl-10" placeholder="Your name" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input {...register('email')} className="input-field pl-10" placeholder="your@email.com" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}