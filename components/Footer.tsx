export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 md:flex md:items-center md:justify-between">
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2024 DeNova. Built on Solana.
          </p>
        </div>
      </div>
    </footer>
  );
}