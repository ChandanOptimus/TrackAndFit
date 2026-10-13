import Link from "next/link";

export default function NotFound() {
  return (
    <main className="landing">
      <h1>Page not found</h1>
      <p>
        <Link href="/">Back to Track And Fit</Link>
      </p>
    </main>
  );
}
