
import React, { useEffect, useState } from 'react';
import { loadStripe, type Stripe, type StripeCardElementChangeEvent } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import type {PaymentConfirmationSubmission} from "../types.ts";

interface Props {
    examId: string|null;
    publishableKey?: string | null;
    errorMessage?: string | null;
    onConfirmed: (data: PaymentConfirmationSubmission) => void;
    onCancel: () => void;
}

const PaymentForm: React.FC<Omit<Props, 'publishableKey'>> = ({
    examId,
    errorMessage,
    onConfirmed,
    onCancel
}) => {
    const stripe = useStripe();
    const elements = useElements();

    const [inputCode, setInputCode] = useState<string|null>(null);
    const [cardErrors, setCardErrors] = useState<string | null>(null);
    const [isCardComplete, setIsCardComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!examId) return null;

    const handleStripeChange = (event: StripeCardElementChangeEvent) => {
        setCardErrors(event.error ? event.error.message : null);
        setIsCardComplete(event.complete);
    };
    
    const onClear = () => {
        setInputCode(null);
        setIsProcessing(false);
        onCancel();
    }

    const onConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        const submission: PaymentConfirmationSubmission = {ExamId: examId};

        // Logic: Priority to Card if complete, otherwise use the Access Code
        if (isCardComplete) {
            if (!stripe || !elements) return;

            setIsProcessing(true);
            const cardElement = elements.getElement(CardElement);

            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement!,
            });

            if (error) {
                setCardErrors(error.message || 'Payment failed');
                setIsProcessing(false);
                return;
            }

            submission.PaymentMethodId = paymentMethod.id;
        } else if (inputCode && inputCode.trim()) {
            submission.AccessCode = inputCode;
        } else {
            return; // Form invalid
        }

        onConfirmed(submission);
        onClear()
    };

    return (
        <div id="paymentConfirm" className="fixed inset-0 flex items-center justify-center bg-teal-600/80 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <form onSubmit={onConfirm} className="space-y-4">

                    <div className="p-3 border border-gray-300 rounded-md">
                        <CardElement onChange={handleStripeChange} />
                    </div>

                    {cardErrors && <div className="text-red-600 text-sm">{cardErrors}</div>}

                    <div className="text-center text-gray-400 text-sm">OR</div>

                    <input
                        type="text"
                        placeholder="Code"
                        value={inputCode||''}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {errorMessage && (
                        <div className="text-red-600 text-sm">{errorMessage}</div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="submitCodeButton"
                            disabled={isProcessing || (!isCardComplete && !inputCode)}
                            className="px-4 py-2 rounded-md bg-blue-600  hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isProcessing ? 'Confirming...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Wrapper Component
 * Handles Stripe initialization so hooks work in the child
 */
export const PaymentConfirmation: React.FC<Props> = (props) => {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    useEffect(() => {
        if (props.publishableKey) {
            setStripePromise(loadStripe(props.publishableKey));
        }
    }, [props.publishableKey]);

    if (!stripePromise) return null;

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
        </Elements>
    );
};