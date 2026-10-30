export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-scan" aria-hidden="true" />
      <div className="page-enter">{children}</div>
    </>
  );
}
