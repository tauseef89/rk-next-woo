import React from 'react';

export default function TermsAndConditions() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto">
      <div className="mb-10 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        
        <section>
          <h3 className="text-xl font-semibold mb-3">1. Nature of the Website</h3>
          <p>
            The website <strong>www.rakeshretails.com</strong> (&quot;Site&quot;) is an e-commerce platform owned and operated by <strong>Rakesh Retails</strong>, having its registered office at Metro Pillar No 2162-T22, D.T.C. Colony 231, near Patel Rd, Block A, Guru Arjun Nagar, Shadipur, New Delhi, Delhi 110008. These Terms of Use govern your use of the Site and the purchase of any products from it. By accessing, browsing, or using this Site, you agree to be bound by these terms.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">2. Account and Registration</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account display name and password.</li>
            <li>You agree that if you provide any information that is untrue, inaccurate, or incomplete, Rakesh Retails reserves the right to indefinitely suspend or terminate your membership.</li>
            <li>Use of the Site is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872. Minors (under 18) may only use the site under the supervision of a parent or guardian.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">3. Order Acceptance and Cancellation</h3>
          <p className="mb-2"><strong>Right to Cancel:</strong> Rakesh Retails reserves the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies in product or pricing information, or problems identified by our fraud avoidance department.</p>
          <p className="mb-2"><strong>Customer Non-Response:</strong> If we are unable to reach you via phone or email within 8 days of an order being placed to verify details, Rakesh Retails reserves the right to cancel the order without further explanation.</p>
          <p><strong>Refunds:</strong> In case of cancellation after your card has been charged, the said amount will be reversed back to your account within a reasonable timeframe.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">4. Pricing and Payment</h3>
          <p className="mb-2"><strong>Pricing Errors:</strong> While Rakesh Retails strives to provide accurate product and pricing information, errors may occur. In the event a product is listed at an incorrect price, we reserve the right to cancel the order and notify you of such cancellation.</p>
          <p><strong>Credit Card Use:</strong> You agree, understand, and confirm that the credit/debit card details provided by you will be correct and accurate. In a credit/debit card transaction, you must use your own card. Rakesh Retails will not be liable for any credit card fraud.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">5. Product Warranty and Liability</h3>
          <p className="mb-2"><strong>Manufacturer Warranty:</strong> All products sold on the Site are serviced by the respective manufacturing companies through their authorized service centers in India. Rakesh Retails is a retailer and does not provide independent warranties unless specifically stated.</p>
          <p><strong>Disclaimer:</strong> This Site and all products are provided on an &quot;as is&quot; and &quot;as available&quot; basis without any representation or warranties, express or implied, except those specified in writing.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">6. Content and Intellectual Property</h3>
          <p>All content included on this Site, such as text, graphics, logos, images, and software, is the property of Rakesh Retails or its content suppliers and is protected by Indian copyright laws. You may not extract, re-utilize, or use any &quot;Content&quot; for commercial purposes without express written consent.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">7. Delivery and Shipping</h3>
          <p className="mb-2"><strong>Check on Receipt:</strong> We request that you check the contents of the package at the time of delivery. Any discrepancies or damages must be brought to our notice immediately.</p>
          <p><strong>Service Area:</strong> Unless otherwise specified, the products on the Site are presented solely for the purpose of sale in India.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">8. Prohibited Use</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Disseminating any unlawful, harassing, libelous, abusive, or otherwise objectionable material.</li>
            <li>Gaining unauthorized access to other computer systems.</li>
            <li>Interfering with any other person&apos;s use or enjoyment of the Site.</li>
            <li>Breaching any applicable laws.</li>
          </ul>
        </section>

        <section className="bg-muted p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-3 text-foreground">11. Grievance Officer</h3>
          <p className="text-sm">In accordance with the Information Technology Act 2000, the contact details are provided below:</p>
          <div className="mt-4 space-y-1 text-sm">
            <p><strong>Name:</strong> _________________</p>
            <p><strong>Email:</strong> _________________</p>
            <p><strong>Address:</strong> ____________________</p>
          </div>
        </section>

      </div>
    </div>
  );
}
