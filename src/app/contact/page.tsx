export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Connect with the Paari Seritech team.</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-medium text-slate-500">Email</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">hello@saaram.ai</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-medium text-slate-500">Location</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">Tamil Nadu, India</div>
        </div>
      </div>
    </main>
  );
}
