import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-600 mb-6">ไม่พบหน้าที่คุณต้องการ</p>
      <Link
        to="/"
        className="text-green-600 underline hover:text-green-700"
      >
        กลับสู่หน้าแรก
      </Link>
    </div>
  );
}
