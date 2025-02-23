import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Check, Brain } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import EmotionalTriggerSelector from '../components/EmotionalTriggerSelector';

type CheckoutStep = 'emotional' | 'shipping' | 'payment' | 'confirmation';

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const initialShippingDetails: ShippingDetails = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
};

const initialPaymentDetails: PaymentDetails = {
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('emotional');
  const [emotionalTrigger, setEmotionalTrigger] = useState<string | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>(initialShippingDetails);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(initialPaymentDetails);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items.length, navigate]);

  if (!user || items.length === 0) {
    return null;
  }

  const handleEmotionalTriggerSubmit = () => {
    if (!emotionalTrigger) {
      showToast({
        title: "Please Select",
        description: "Take a moment to identify how you're feeling before proceeding.",
        type: "error",
        duration: 3000
      });
      return;
    }
    setCurrentStep('shipping');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // First check if user has set a budget
      const { data: budgetData } = await supabase
        .rpc('get_current_budget', { user_id: user?.id });

      if (!budgetData || budgetData.length === 0) {
        showToast({
          title: "Budget Required",
          description: "Please set your monthly budget in Settings before making a purchase.",
          type: "error",
          duration: 5000,
        });
        navigate('/settings');
        return;
      }

      // Create order in database with emotional trigger
      const { data, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: totalPrice,
          shipping_address: shippingDetails,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          emotional_trigger: emotionalTrigger
        })
        .select()
        .single();

      if (orderError) {
        if (orderError.message.includes('Insufficient budget')) {
          throw new Error('You have insufficient budget and points for this purchase');
        }
        throw orderError;
      }

      // Send order confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-purchase-email', {
        body: {
          orderNumber: data.order_number,
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: totalPrice,
          emotionalTrigger
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw error here, as the order was successful
      }
      
      setOrderNumber(data.order_number);
      setCurrentStep('confirmation');
      clearCart();

      showToast({
        title: "Order placed successfully! 🎉",
        description: "Your order has been confirmed. Check your email for details.",
        type: "success",
        duration: 5000,
      });

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your order');
      
      showToast({
        title: "Order Failed",
        description: err instanceof Error ? err.message : 'Failed to process your order',
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between">
            <div className="flex items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-sm font-medium text-gray-900">${totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm text-gray-500">Shipping</p>
            <p className="text-sm font-medium text-gray-900">Free</p>
          </div>
          <div className="flex justify-between mt-2 text-lg font-bold">
            <p>Total</p>
            <p>${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmotionalStep = () => (
    <div>
      <EmotionalTriggerSelector
        selectedTrigger={emotionalTrigger}
        onSelect={setEmotionalTrigger}
      />
      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate('/cart')}
          className="text-gray-600 hover:text-gray-900"
        >
          Back to Cart
        </button>
        <button
          onClick={handleEmotionalTriggerSubmit}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <form onSubmit={handleShippingSubmit} className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>IMPORTANT:</strong> This is a fake checkout environment. For your security, DO NOT enter real personal information, credit card numbers, address, or banking details. Please use test/dummy data only. Any real personal information entered is at your own risk.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={shippingDetails.fullName}
            onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            type="text"
            id="address"
            required
            value={shippingDetails.address}
            onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              required
              value={shippingDetails.city}
              onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              required
              value={shippingDetails.state}
              onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            required
            value={shippingDetails.zipCode}
            onChange={(e) => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('emotional')}
          className="text-gray-600 hover:text-gray-900"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>IMPORTANT:</strong> This is a fake checkout environment. For your security, DO NOT enter real personal information, credit card numbers, address, or banking details. Please use test/dummy data only. Any real personal information entered is at your own risk.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            required
            placeholder="1234 5678 9012 3456"
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              required
              placeholder="MM/YY"
              value={paymentDetails.expiryDate}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              required
              placeholder="123"
              value={paymentDetails.cvv}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('shipping')}
          className="text-gray-600 hover:text-gray-900"
        >
          Back to Shipping
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </form>
  );

  const renderConfirmationStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">Order Confirmed!</h2>
      <p className="mt-2 text-gray-600">
        Thank you for your purchase. Your order number is:
      </p>
      <p className="mt-2 text-xl font-mono font-bold text-indigo-600">
        {orderNumber}
      </p>
      <div className="mt-8 space-y-4">
        <button
          onClick={() => navigate('/history')}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Order History
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Cart
      </button>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-8">
              {['emotional', 'shipping', 'payment', 'confirmation'].map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center ${
                    index < ['emotional', 'shipping', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'text-indigo-600'
                      : index === ['emotional', 'shipping', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-current">
                    {step === 'emotional' ? (
                      <Brain className="h-4 w-4" />
                    ) : step === 'shipping' ? (
                      <Truck className="h-4 w-4" />
                    ) : step === 'payment' ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 w-12 mx-2 ${
                        index < ['emotional', 'shipping', 'payment', 'confirmation'].indexOf(currentStep)
                          ? 'bg-indigo-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {currentStep === 'emotional' && renderEmotionalStep()}
            {currentStep === 'shipping' && renderShippingStep()}
            {currentStep === 'payment' && renderPaymentStep()}
            {currentStep === 'confirmation' && renderConfirmationStep()}
          </div>
        </div>

        <div className="lg:w-96">
          {currentStep !== 'confirmation' && renderOrderSummary()}
        </div>
      </div>
    </div>
  );
}