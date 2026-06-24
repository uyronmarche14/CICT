export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(110, 41, 246, 0.025) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
