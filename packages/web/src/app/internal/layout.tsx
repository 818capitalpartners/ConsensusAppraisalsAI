/**
 * Internal tools layout — no public Header/Footer.
 * These pages are for internal deal routing, not customer-facing.
 */
export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
