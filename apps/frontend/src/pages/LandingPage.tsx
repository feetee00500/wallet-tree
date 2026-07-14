import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <h1 className="text-4xl font-bold text-green-700 mb-2">Wallet Tree</h1>
      <p className="text-gray-600 mb-8 text-center">
        ติดตามรายรับรายจ่ายของคุณอย่างง่ายดาย
      </p>
      <Link
        to="/login"
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        เข้าสู่ระบบ
      </Link>
    </div>
  );
}
