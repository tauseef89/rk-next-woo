import Link from "next/link";

export default function FailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p>
          Your payment could not be completed.
        </p>

        <Link
          href="/checkout"
          className="underline"
        >
          Retry Payment
        </Link>
      </div>
    </div>
  );
}