import { Section, Container } from "@/components/craft";
import { ShieldCheck, Truck, Zap, CreditCard } from "lucide-react";

const features = [
  {
    title: "Extended Warranty",
    desc: "Got a question? Look no further calls us.",
    icon: <ShieldCheck className="w-8 h-8 text-red-900" />,
  },
  {
    title: "Free Delivery",
    desc: "Available on all our products.",
    icon: <Truck className="w-8 h-8 text-red-900" />,
  },
  {
    title: "Trusted Tech Delivered Fast",
    desc: "Now in 90 Minutes",
    icon: <Zap className="w-8 h-8 text-red-900" />,
  },
  {
    title: "Easy Installment",
    desc: "Pay for your purchase in easy EMIs.",
    icon: <CreditCard className="w-8 h-8 text-red-900" />,
  },
];

export default function Features() {
  return (
    <Section className="bg-gray-50 border-y border-gray-200 py-5 md:py-5">
      <Container className="max-w-7xl lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, i) => (
            <div key={i} className="flex items-start flex-col gap-4">
              <div className="shrink-0">{item.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight uppercase text-sm">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
