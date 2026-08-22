import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { InputField } from '@/shared/components/ui/InputField';
import { Card } from '@/shared/components/ui/Card';
import { Modal } from '@/shared/components/ui/Modal';

export const UITestPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="min-h-screen bg-bg-page p-8 flex flex-col gap-12">
            <header>
                <h1 className="text-2xl font-bold text-fg">Aurai UI Playground</h1>
                <p className="text-fg-body mt-2">Inspect components, states, and animations.</p>
            </header>

            {/* BUTTONS */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-fg-strong">Buttons</h2>
                <Card variant="inner" className="flex flex-wrap gap-6 items-center">
                    <Button variant="primary">Primary</Button>
                    <Button variant="gradient">Gradient</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="inactive">Inactive</Button>
                    <Button variant="primary" isLoading>
                        Loading
                    </Button>
                    <Button variant="primary" disabled>
                        Disabled
                    </Button>
                </Card>
                <p className="text-xs text-fg-muted">
                    * Click and hold buttons to see the <code>scale(0.97)</code> active state animation.
                </p>
            </section>

            {/* INPUTS */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-fg-strong">Input Fields</h2>
                <Card variant="inner" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        id="default"
                        label="Default Input"
                        placeholder="Enter text..."
                    />
                    <InputField
                        id="filled"
                        label="Filled Input"
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    />
                    <InputField
                        id="hint"
                        label="With Hint"
                        placeholder="Enter email"
                        hint="We'll never share your email."
                    />
                    <InputField
                        id="error"
                        label="Error State"
                        placeholder="Invalid data"
                        error="This field is required."
                    />
                    <InputField
                        id="disabled"
                        label="Disabled Input"
                        placeholder="Can't touch this"
                        disabled
                    />
                </Card>
            </section>

            {/* CARDS */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-fg-strong">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card variant="default">
                        <h3 className="font-semibold text-fg mb-2">Default Card</h3>
                        <p className="text-sm text-fg-body">Uses the default shadow and background.</p>
                    </Card>
                    <Card variant="elevated">
                        <h3 className="font-semibold text-fg mb-2">Elevated Card</h3>
                        <p className="text-sm text-fg-body">Uses the larger card shadow.</p>
                    </Card>
                    <Card variant="inner">
                        <h3 className="font-semibold text-fg mb-2">Inner Card</h3>
                        <p className="text-sm text-fg-body">White background, smaller radius.</p>
                    </Card>
                </div>
            </section>

            {/* MODALS */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-fg-strong">Modals</h2>
                <Card variant="inner">
                    <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                    <p className="text-xs text-fg-muted mt-4">
                        * Modal uses <code>scale(0.95)</code> to <code>scale(1)</code> with a strong custom <code>ease-out</code> curve.
                    </p>
                </Card>
            </section>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Test Modal">
                <div className="flex flex-col gap-4">
                    <p className="text-fg-body">
                        This is a test modal. It animates in from <code>scale(0.95)</code> and fades in.
                        The overlay fades smoothly. Click outside or the button to close.
                    </p>
                    <InputField id="modal-input" label="Inside Modal" placeholder="Type something..." />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => setIsModalOpen(false)}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};