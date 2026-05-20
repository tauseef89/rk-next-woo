import React from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto">
      <div className="mb-10 border-b pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-10 text-sm md:text-base leading-relaxed">
        
        <section>
          <h3 className="text-xl font-semibold mb-3">1. General</h3>
          <p>
            <strong>Rakesh Retails</strong>, having its registered address at Metro Pillar No, 2162-T22, D.T.C. Colony 231, near Patel Rd, Block A, Guru Arjun Nagar, Shadipur, New Delhi, Delhi 110008 (&ldquo;Rakesh Retails&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) is managing and operating the mobile application and website <strong>www.rakeshretails.com</strong>.
          </p>
          <p className="mt-2 text-muted-foreground text-xs italic">
            This document is an electronic record under the Information Technology Act, 2000 and does not require physical or digital signatures.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">2. Type of Information Collected</h3>
          </div>
          <ul className="list-disc pl-5 space-y-3">
            <li><strong>Personal Information:</strong> Your name, mailing address, phone number, email address, gender, and date of birth.</li>
            <li><strong>Sensitive Personal Data (SPDI):</strong> Passwords for account access. Financial information (bank account, credit/debit card details) is handled through secure payment gateways.</li>
            <li><strong>Minors:</strong> The Platform is not intended for users under 18 years. If we learn we have collected data from a minor without parental consent, we will delete it promptly.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold m-0">3. Use of Information</h3>
          </div>
          <p>We use the information collected to:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 list-none font-medium">
            <li className="bg-muted p-2 rounded text-sm">✓ Process & deliver orders</li>
            <li className="bg-muted p-2 rounded text-sm">✓ Manage your account</li>
            <li className="bg-muted p-2 rounded text-sm">✓ Send invoices & updates</li>
            <li className="bg-muted p-2 rounded text-sm">✓ Prevent fraud/illegal acts</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">4. Disclosure of Information</h3>
          <p>
            We may share information with trusted <strong>Third-Party Providers</strong> (logistics partners, payment gateways) strictly to fulfill your orders. Rakesh Retails does not store your full card details and is not liable for the actions of third-party payment processors.
          </p>
        </section>

        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold m-0">5. Security</h3>
          </div>
          <p className="text-sm">
            We implement industry-standard measures, including firewalls and <strong>Transport Layer Security (TLS)</strong>, to protect your data. While we use commercially acceptable means, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 className="text-lg font-semibold mb-2">6. Cookies Policy</h3>
            <p className="text-sm">We use cookies to analyze web traffic and improve user experience. You may disable cookies in your browser settings, though this may limit certain features.</p>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">7. Opt-Out Policy</h3>
            <p className="text-sm">You can unsubscribe from promotional emails by clicking the &quot;unsubscribe&quot; link or contacting us at [Insert Support Email].</p>
          </section>
        </div>

        <section className="bg-primary/5 p-6 rounded-xl border border-primary/10">
          <h3 className="text-xl font-bold mb-4">10. Grievance Redressal</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> ________________________</p>
            <p><strong>Designation:</strong> _____________________</p>
            <p><strong>Email:</strong> _____________________________</p>
          </div>
        </section>

      </div>
    </div>
  );
}
