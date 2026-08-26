import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { RegistrationStepper } from '@/features/products/components/register/RegistrationStepper';
import { ProductIdentityForm } from '@/features/products/components/register/ProductIdentityForm';
import { useCreateProduct } from '@/features/products/hooks/useCreateProduct';
import { z } from 'zod';
import { PRODUCT_REGISTRATION_TYPES } from '@/features/products/types/productTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const schema = z.object({
  name: z.string().trim().min(3, 'Product name must be at least 3 characters').max(80, 'Too long'),
  type: z.string().refine((v) => (PRODUCT_REGISTRATION_TYPES as readonly string[]).includes(v), {
    message: 'Please select a registration type',
  }),
  description: z.string().trim().max(500, 'Description too long (max 500)').optional().or(z.literal('')),
});

const RegisterProductPage: React.FC = () => {
  const navigate = useNavigate();
  const create = useCreateProduct();
  const [form, setForm] = useState({ name: '', type: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = String(i.path[0]);
        if (!e[k]) e[k] = i.message;
      });
      setErrors(e);
      return;
    }
    setErrors({});
    try {
      const product = await create.mutateAsync({
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description || undefined,
      });
      toast.success('Product registered');
      if (product?.id) {
        navigate(`/products/${product.id}/sources`);
      } else {
        navigate('/products');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: unknown } } };
      const detail = axiosErr?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const mapped: Record<string, string> = {};
        (detail as Array<{ loc?: unknown[]; msg?: string }>).forEach((item) => {
          const field = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1]) : undefined;
          if (field && item.msg && !mapped[field]) mapped[field] = item.msg;
        });
        if (Object.keys(mapped).length) { setErrors(mapped); return; }
      }
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Hero Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Register Product Knowledge</h2>
        <p className="font-sans font-medium text-sm text-fg-body">Configure your product parameters and feed files or text sources to build the product intelligence engine.</p>
      </div>

      {/* Stepper */}
      <RegistrationStepper currentStep={1} />

      {/* Form Card */}
      <ProductIdentityForm form={form} errors={errors} onChange={handleChange} onSubmit={handleSubmit} isLoading={create.isPending} />
    </div>
  );
};

export default WithNavbar(RegisterProductPage);
