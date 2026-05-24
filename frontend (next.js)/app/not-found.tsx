"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="card">
        <div className="badge">404</div>
        <div className="illustration">
          <svg
            viewBox="0 0 200 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="svg-art"
          >
            {/* Monitor / Laptop */}
            <rect x="40" y="30" width="120" height="80" rx="8" fill="#E6F1FB" stroke="#378ADD" strokeWidth="2" />
            <rect x="48" y="38" width="104" height="64" rx="4" fill="#B5D4F4" />
            {/* Screen content - broken lines */}
            <rect x="60" y="50" width="40" height="6" rx="3" fill="#85B7EB" opacity="0.7" />
            <rect x="60" y="62" width="60" height="6" rx="3" fill="#85B7EB" opacity="0.5" />
            <rect x="60" y="74" width="30" height="6" rx="3" fill="#85B7EB" opacity="0.3" />
            {/* Error icon on screen */}
            <circle cx="120" cy="67" r="16" fill="#FCEBEB" />
            <text x="120" y="72" textAnchor="middle" fontSize="16" fill="#A32D2D" fontWeight="bold">!</text>
            {/* Stand */}
            <rect x="90" y="110" width="20" height="10" rx="2" fill="#B5D4F4" />
            <rect x="75" y="120" width="50" height="6" rx="3" fill="#85B7EB" />

            {/* Floating elements */}
            <circle cx="35" cy="25" r="8" fill="#EEEDFE" stroke="#7F77DD" strokeWidth="1.5" opacity="0.7" />
            <circle cx="170" cy="35" r="6" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="1.5" opacity="0.7" />
            <circle cx="25" cy="90" r="5" fill="#FAEEDA" stroke="#BA7517" strokeWidth="1.5" opacity="0.7" />
          </svg>
        </div>

        <h1 className="title">Halaman Tidak Ditemukan</h1>
        <p className="subtitle">
          Oops! Halaman yang kamu cari tidak ada atau mungkin sudah dipindahkan.
        </p>

        <div className="actions">
          <Link href="/dashboard" className="btn-primary">
            Ke Dashboard
          </Link>
          <Link href="/" className="btn-secondary">
            Halaman Utama
          </Link>
        </div>

        <p className="hint">
          Butuh bantuan?{" "}
          <Link href="/support" className="link">
            Hubungi Administrator
          </Link>
        </p>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4f8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 2rem;
        }

        .card {
          background: #ffffff;
          border-radius: 20px;
          padding: 3rem 2.5rem;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid #e8edf2;
        }

        .badge {
          display: inline-block;
          background: #E6F1FB;
          color: #185FA5;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 1.5rem;
          border: 1px solid #B5D4F4;
        }

        .illustration {
          margin: 0 auto 1.75rem;
          width: 200px;
          height: 160px;
        }

        .svg-art {
          width: 100%;
          height: 100%;
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          color: #1a2234;
          margin: 0 0 0.75rem;
          letter-spacing: -0.3px;
        }

        .subtitle {
          font-size: 14.5px;
          color: #6b7a96;
          line-height: 1.65;
          margin: 0 0 2rem;
          padding: 0 0.5rem;
        }

        .actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          background: #185FA5;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 22px;
          border-radius: 10px;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-primary:hover {
          background: #0C447C;
          transform: translateY(-1px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          background: #f4f6fa;
          color: #3d4f6e;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 22px;
          border-radius: 10px;
          border: 1px solid #e2e7ef;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-secondary:hover {
          background: #e8edf6;
          transform: translateY(-1px);
        }

        .hint {
          font-size: 13px;
          color: #9aa5bc;
          margin: 0;
        }

        .link {
          color: #185FA5;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
