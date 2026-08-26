import React from 'react';
import { InputField, Select, Textarea, Button } from '@/shared/components/ui';
import { PRODUCT_REGISTRATION_TYPES } from '@/features/products/types/productTypes';

interface FormState {
  name: string;
  type: string;
  description: string;
}

interface Props {
  form: FormState;
  errors: Record<string, string>;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const ProductIdentityForm: React.FC<Props> = ({ form, errors, onChange, onSubmit, isLoading }) => {
  return (
    <div className="w-full max-w-[874px] mx-auto bg-bg-sidebar border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputField
          label="Product / Service Name *"
          placeholder="Aurai Sales"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={errors.name}
        />
        <Select
          label="Registration Type *"
          value={form.type}
          onChange={(e) => onChange('type', e.target.value)}
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
      </div>

      <Textarea
        label="Short Description (Optional)"
        placeholder="This outreach initiative is designed to enhance our engagement with prospective clients who have expressed interest in our innovative product range. By employing tailored communication techniques, we aim to boost interaction and improve conversion rates."
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={errors.description}
        rows={6}
        className="min-h-[160px]"
      />

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[144px] h-11 px-6"
        >
          Next: Attach Sources
        </Button>
      </div>
    </div>
  );
};
