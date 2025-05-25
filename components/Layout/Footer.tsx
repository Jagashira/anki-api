// app/components/Footer.tsx

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "1.5rem 2rem",
        borderTop: "1px solid #eaeaea",
        marginTop: "auto", // メインコンテンツが短い場合でもフッターを最下部に
        backgroundColor: "#f9f9f9", // お好みの背景色に
      }}
    >
      <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>
        &copy; {currentYear} 議事録アプリ. All Rights Reserved.
      </p>
      <p style={{ margin: "0.5rem 0 0", color: "#777", fontSize: "0.8rem" }}>
        Powered by Whisper & ChatGPT
      </p>
    </footer>
  );
};

export default Footer;
