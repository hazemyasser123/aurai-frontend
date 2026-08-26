import React, { useState, useEffect } from 'react';
import { Modal, InputField, Select, Textarea, Button } from '@/shared/components/ui';
import { z } from 'zod';
import { useCreateProduct } from '@/features/products/hooks/useCreateProduct';
import { PRODUCT_REGISTRATION_TYPES } from '@/features/products/types/productTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const schema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80),
  type: z.string().refine((v) => (PRODUCT_REGISTRATION_TYPES as readonly string[]).includes(v), {
    message: 'Please select a registration type',
  }),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterProductModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: '', type: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const create = useCreateProduct();

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', type: '', description: '' });
      setErrors({});
    }
  }, [isOpen]);

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
    try {
      await create.mutateAsync(parsed.data);
      toast.success('Product registered');
      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Register Product">
      <div className="flex flex-col gap-4">
        <InputField
          label="PRODUCT NAME *"
          placeholder="e.g. AI WhatsApp Agent"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
        />
        <Select
          label="TYPE *"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
          error={errors.type}
        >
          <option value="" disabled>
            Select type...
          </option>
          {PRODUCT_REGISTRATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Textarea
          label="DESCRIPTION"
          placeholder="What does this product do?"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          rows={3}
        />
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={create.isPending}>Register</Button>
        </div>
      </div>
    </Modal>
  );
};
