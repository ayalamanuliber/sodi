export function Ambient() {
  return (
    <>
      <div
        className="fixed top-[-12%] left-[-6%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[140px] pointer-events-none z-[-1] opacity-70"
        style={{ background: "radial-gradient(circle, rgba(0,255,163,.06) 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-12%] right-[-6%] w-[40vw] h-[40vw] max-w-[480px] max-h-[480px] rounded-full blur-[120px] pointer-events-none z-[-1] opacity-50"
        style={{ background: "radial-gradient(circle, rgba(60,90,255,.04) 0%, transparent 70%)" }}
      />
    </>
  );
}
