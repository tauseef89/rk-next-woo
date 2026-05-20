// app/checkout/order-pay/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function getOrder(orderId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64')}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function OrderPayPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) notFound();

  // Server Action to confirm the COD order
  async function confirmOrder() {
    'use server';
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        status: 'processing', // Standard status for confirmed COD orders
        set_paid: false,      // COD is not "paid" until delivery
      }),
    });

    if (res.ok) {
      revalidatePath(`/checkout/order-pay/${params.id}`);
      redirect(`/checkout/order-received/${params.id}?key=${order.order_key}`);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Confirm Your Order</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {order.line_items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{order.currency_symbol}{item.total}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
              <span>Total to pay on delivery:</span>
              <span>{order.currency_symbol}{order.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border rounded-lg shadow-sm flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-2">Cash on Delivery</h2>
          <p className="text-gray-600 mb-8">
            You will pay for your order in cash when it is delivered to your address.
          </p>
          
          <form action={confirmOrder}>
            <button 
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-md font-bold hover:bg-green-700 transition uppercase tracking-wide"
            >
              Confirm Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
