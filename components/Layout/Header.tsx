// app/components/Header.tsx
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #eaeaea",
        backgroundColor: "#ffffff", // お好みの背景色に
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Image
          src="/logo.svg" // publicフォルダ内のロゴファイルを指定
          alt="議事録アプリ ロゴ"
          width={150} // ロゴの実際の幅に合わせて調整してください
          height={40} // ロゴの実際の高さに合わせて調整してください
          priority
        />
        {/* <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>議事録アプリ</span> */}
      </Link>
      <nav>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "1rem",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link href="/" style={{ textDecoration: "none", color: "#333" }}>
              ホーム
            </Link>
          </li>
          <li>
            <Link href="/new" style={{ textDecoration: "none", color: "#333" }}>
              新規作成
            </Link>
          </li>
          <li>
            <Link
              href="/history"
              style={{ textDecoration: "none", color: "#333" }}
            >
              履歴
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
