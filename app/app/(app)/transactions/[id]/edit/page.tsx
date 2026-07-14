'use client';

import { useParams } from 'next/navigation';

export default function EditTransactionPage() {
  const params = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไขรายการ</h1>
      <p className="text-gray-500">กำลังพัฒนา... ID: {params.id as string}</p>
    </div>
  );
}
