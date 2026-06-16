export default function AiLoader() {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="w-1 h-4 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
