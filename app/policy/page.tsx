import React from 'react';
import { Truck, Package, Clock, ShieldCheck } from 'lucide-react'; // Basic icons if you have lucide-react installed

export default function ShippingPolicy() {
  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto">
      <div className="mb-10 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Shipping Policy</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          At Rakesh Retails, we strive to deliver your electronics safely and swiftly. Our logistics network is optimized to handle sensitive equipment like smartphones, laptops, and large home appliances with the utmost care.
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-10 text-sm md:text-base">
        
        {/* Delivery Timelines */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">1. Delivery Timelines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-bold mb-1">Local (Delhi-NCR)</p>
              <p className="text-sm">24 to 48 Hours</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-bold mb-1">Metro Cities</p>
              <p className="text-sm">3 to 5 Business Days</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-bold mb-1">Rest of India</p>
              <p className="text-sm">5 to 7 Business Days</p>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground italic">
            Orders placed before 4:00 PM are processed same-day. Orders placed on Sundays/Holidays process next working day.
          </p>
        </section>

        {/* Shipping Charges */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">2. Shipping Charges</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Standard Shipping:</strong> Free on orders above ₹1,000.</li>
            <li><strong>Small Orders:</strong> A nominal fee of ₹99 applies below the free shipping threshold.</li>
            <li><strong>Express Delivery:</strong> Available in select locations for an additional charge at checkout.</li>
          </ul>
        </section>

        {/* Secure Packaging */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">4. Secure Packaging & Inspection</h3>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-900">
            <p className="font-semibold mb-2">Important Notice:</p>
            <p><strong>Tamper-Proof Seals:</strong> Do not accept the package if the seal is broken. For large appliances, <strong>please do not unbox items yourself</strong>. Authorized technicians will handle unboxing to ensure your warranty remains valid.</p>
          </div>
        </section>

        {/* Other Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 className="text-lg font-semibold mb-2">3. Order Tracking</h3>
            <p>Tracking details will be sent via SMS/Email once dispatched, including the partner name (Blue Dart, Delhivery, etc.) and a unique Tracking ID.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">6. Non-Availability</h3>
            <p>Our partners attempt delivery 3 times. If unsuccessful, the product returns to our warehouse and a re-shipping fee may apply.</p>
          </section>
        </div>

        {/* Installation */}
        <section>
          <h3 className="text-xl font-semibold mb-3">5. Installation of Large Appliances</h3>
          <p>Technician visits are scheduled within 24-48 hours of delivery. Any damage found after self-unboxing may void replacement claims.</p>
        </section>

        {/* Contact Footer */}
        <section className="bg-slate-900 text-white p-8 rounded-2xl mt-12">
          <h3 className="text-xl font-bold mb-4 text-white">Shipping Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Helpline</p>
              <p className="text-lg font-medium">8130047218</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-lg font-medium">shipping@rakeshtails.com</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 italic">Available 10:00 AM to 7:00 PM (Seven Days)</p>
        </section>

      </div>
    </div>
  );
}
