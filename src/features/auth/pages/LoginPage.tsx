import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputField, Card } from '@/shared/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { loginSchema } from '@/features/auth/schemas/authSchemas';
import type { LoginFormData } from '@/features/auth/types/authTypes';
import mainIcon from '@/assets/mainIcon.svg';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof LoginFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Partial<LoginFormData> = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof LoginFormData;
                fieldErrors[fieldName] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        loginMutation.mutate(formData, {
            onSuccess: () => {
                navigate('/');
            },
        });
    };

    const hasErrors = Object.values(errors).some((val) => val);
    const isFormInvalid = !formData.username || !formData.password || hasErrors;
    return (
        <div className="relative min-h-screen bg-bg-page flex items-center justify-center p-4 overflow-hidden">
            {/* Ambient Gradient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-logo opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-brand opacity-20 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Login Card */}
            <Card variant="elevated" className="w-full max-w-md relative z-10 backdrop-blur-md bg-opacity-90">
                <div className="mb-8 text-center flex flex-col items-center gap-4">
                    <img src={mainIcon} alt="Aurai Icon" className="w-16 h-16 object-contain" />
                    <div>
                        <h1 className="text-2xl font-bold text-fg">Welcome to Aurai</h1>
                        <p className="text-sm text-fg-body mt-2">Sign in to your sales copilot</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <InputField
                        id="username"
                        name="username"
                        label="Username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        disabled={loginMutation.isPending}
                    />

                    <InputField
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        disabled={loginMutation.isPending}
                    />

                    {/* Centered Button */}
                    <div className="flex justify-center mt-2">
                        <Button
                            type="submit"
                            variant="gradient"
                            isLoading={loginMutation.isPending}
                            disabled={isFormInvalid}
                            className="w-full max-w-none mt-2"
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};