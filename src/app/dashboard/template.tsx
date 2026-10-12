export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-scan" aria-hidden="true" />
      <div className="panel-enter">{children}</div>
    </>
  );
}
