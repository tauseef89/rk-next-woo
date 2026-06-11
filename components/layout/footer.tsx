import Link from "next/link";
import { Section, Container } from "@/components/craft";
import { mainMenu, contentMenu, policyMenu, shopMenu } from "@/menu.config";
import { NewsletterForm } from "./newsletter-form";
import FooterMegaMenu from "./footer-mega-menu";
import Image from "next/image";
import Features from "./features";
export function Footer() {
  return (
    <footer>
    <Features /> {/* This adds the 4 boxes */}
      <Section className="bg-[#0a2454]">
        <Container className="max-w-7xl lg:px-0 grid md:grid-cols-[1.5fr_0.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <NewsletterForm />
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base text-white">Website</h5>
            {Object.entries(mainMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4 text-gray-400 hover:text-white"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base text-white">Quick Links</h5>
            {Object.entries(shopMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4 text-gray-400 hover:text-white"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base text-white">Policy and Disclosure</h5>
            {policyMenu.map((parent) => (
              <Link
                className="hover:underline underline-offset-4 text-gray-400 hover:text-white"
                key={parent.slug}
                href={parent.slug}
              >
                {parent.name}
              </Link>
            ))}
          </div>
        </Container>
        <Container className="max-w-7xl lg:px-0 border-t border-gray-700 not-prose">
          <FooterMegaMenu />
        </Container>
        
<Container className="max-w-7xl lg:px-0 border-t border-gray-700 not-prose flex flex-col md:flex-row gap-8 justify-between items-center py-10">
  
  {/* Column 1: Copyright Info */}
  <div className="flex flex-col gap-1 text-center md:text-left">
    <p className="text-sm font-medium text-gray-400">
      &copy; 2000-2026, Rakesh Retails. All rights reserved.
    </p>
    <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
      Delhi NCR’s Largest Electronics & Digital Retailer.
    </p>
  </div>

  {/* Column 2: Payment & Partner Icons */}
  <div className="flex flex-col items-center md:items-end gap-4">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      Secure Payment Partners
    </span>
    <div className="flex items-center gap-6 px-0 py-3 ">

      {/* Pine Labs - Often seen in Indian Retail for EMI/POS */}
      <Image 
          src="/pinelabs.png" 
          alt="Pine Labs" 
          width={70} 
          height={30} 
          className="h-4 w-auto object-contain"
        />

      

    </div>
  </div>
</Container>

      </Section>
    </footer>
  );
}
