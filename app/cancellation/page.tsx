import React from 'react';
import { Ban, CreditCard, RotateCcw, AlertCircle } from 'lucide-react';

export default function CancellationPolicy() {
  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto">
      <div className="mb-10 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 uppercase">Cancellation Policy</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          At Rakesh Retails, we value your flexibility. Below are our guidelines regarding order cancellations and associated refunds.
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-10 text-sm md:text-base">
        
        {/* Order Cancellation */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-destructive" />
            <h3 className="text-xl font-semibold m-0">1. Order Cancellation by Customer</h3>
          </div>
          <p className="mb-4">
            You can cancel your order for any product before it has been <strong>dispatched</strong> from our warehouse. 
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Before Dispatch:</strong> A full refund will be processed immediately.</li>
            <li><strong>After Dispatch:</strong> Once an order is in transit, it cannot be cancelled. You may refuse the delivery, but shipping and return logistics charges may be deducted from the refund.</li>
          </ul>
        </section>

        {/* Refund Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">2. Refund Process & Timelines</h3>
          </div>
          <p>Once a cancellation is confirmed, the refund will be credited back to your original payment method:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-bold mb-1">Credit/Debit Cards & Net Banking</p>
              <p className="text-sm text-muted-foreground">5 to 7 business days</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-bold mb-1">Wallets & UPI</p>
              <p className="text-sm text-muted-foreground">24 to 48 business hours</p>
            </div>
          </div>
        </section>

        {/* Non-Cancellable Items */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-semibold m-0">3. Non-Cancellable Items</h3>
          </div>
          <p>
            Specific high-demand or customized electronic items marked as <strong>&quot;Non-Cancellable&quot;</strong> on the product page cannot be cancelled once the order is placed. Please review the product details carefully before purchase.
          </p>
        </section>

        {/* Management Cancellation */}
        <section>
          <h3 className="text-xl font-semibold mb-3">4. Cancellation by Rakesh Retails</h3>
          <p>
            We reserve the right to cancel orders for reasons including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Unavailability of stock or production issues.</li>
            <li>Inaccuracies in product or pricing information.</li>
            <li>Issues identified by our credit and fraud avoidance department.</li>
          </ul>
        </section>

        {/* Footer Contact */}
        <section className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Need help with a cancellation?</h3>
              <p className="text-slate-600">Contact our support team for immediate assistance.</p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4" />
                Helpline: 8130047218
              </p>
              <p className="text-sm text-slate-500">Available 10 AM - 7 PM</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
