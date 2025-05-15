// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t text-sm text-gray-600 mt-12 px-6 py-4 text-center">
      <p>
        © {new Date().getFullYear()} 議事録くん —{" "}
        <a href="/terms" className="underline hover:text-blue-600">
          利用規約
        </a>{" "}
        ｜{" "}
        <a href="/support" className="underline hover:text-blue-600">
          サポート
        </a>
      </p>
    </footer>
  );
}
