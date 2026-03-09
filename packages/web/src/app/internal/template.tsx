/**
 * Internal tools template — no Header/Footer.
 * Overrides the root template for internal routes.
 */
export default function InternalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
