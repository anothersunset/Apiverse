import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'APIVerse - 探索无限API宇宙',
  description: '发现、测试和集成最优质的API，构建强大的应用程序',
  keywords: ['API', 'REST', 'GraphQL', '开发工具', 'API市场'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}