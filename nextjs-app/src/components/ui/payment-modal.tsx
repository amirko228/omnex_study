'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    planName: string;
    price: string;
}

export function PaymentModal({ isOpen, onClose, onConfirm, planName, price }: PaymentModalProps) {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [touched, setTouched] = useState({ card: false, expiry: false, cvc: false });

    // Validation
    const validateCard = (num: string) => /^\d{16}$/.test(num.replace(/\s/g, ''));
    const validateExpiry = (exp: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
    const validateCvc = (code: string) => /^\d{3,4}$/.test(code);

    const isFormValid = validateCard(cardNumber) && validateExpiry(expiry) && validateCvc(cvc);

    const handleConfirm = async () => {
        if (!isFormValid) {
            setError('Please check your card details');
            return;
        }

        setStep('processing');
        setError(null);
        try {
            await onConfirm();
            setStep('success');
            setTimeout(() => {
                onClose();
                setStep('details');
                // Reset form
                setCardNumber('');
                setExpiry('');
                setCvc('');
            }, 2000);
        } catch (err) {
            setError('Payment failed. Please try again.');
            setStep('details');
        }
    };

    const formatCardNumber = (val: string) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.length > 1 ? parts.join(' ') : v;
    };

    const formatExpiry = (val: string) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <AnimatePresence mode="wait">
                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <DialogHeader>
                                <DialogTitle>Upgrade to {planName}</DialogTitle>
                                <DialogDescription>
                                    You are about to subscribe to the {planName} plan for {price}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="card">Card Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="card"
                                            placeholder="0000 0000 0000 0000"
                                            className={`pl-9 ${touched.card && !validateCard(cardNumber) ? 'border-red-500' : ''}`}
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value.substring(0, 19)))}
                                            onBlur={() => setTouched({ ...touched, card: true })}
                                            maxLength={19}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="expiry">Expiry</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="expiry"
                                                placeholder="MM/YY"
                                                className={`pl-9 ${touched.expiry && !validateExpiry(expiry) ? 'border-red-500' : ''}`}
                                                value={expiry}
                                                onChange={(e) => setExpiry(formatExpiry(e.target.value.substring(0, 5)))}
                                                onBlur={() => setTouched({ ...touched, expiry: true })}
                                                maxLength={5}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="cvc"
                                                placeholder="123"
                                                type="password"
                                                className={`pl-9 ${touched.cvc && !validateCvc(cvc) ? 'border-red-500' : ''}`}
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                                                onBlur={() => setTouched({ ...touched, cvc: true })}
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
                            <DialogFooter>
                                <Button variant="outline" onClick={onClose}>Cancel</Button>
                                <Button onClick={handleConfirm} disabled={!isFormValid}>Pay {price}</Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <h3 className="text-lg font-semibold">Processing Payment...</h3>
                            <p className="text-muted-foreground">Please do not close this window.</p>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold">Payment Successful!</h3>
                            <p className="text-muted-foreground">Welcome to {planName}!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
