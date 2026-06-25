export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <p className="mb-2 text-sm font-medium text-accent">Life Saver AI</p>
      <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>
    </header>
  );
}
