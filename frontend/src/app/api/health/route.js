// Next.js API Route - 健康检查
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'APIVerse 服务运行正常',
    timestamp: new Date().toISOString()
  });
}
