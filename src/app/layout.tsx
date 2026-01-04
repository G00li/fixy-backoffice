import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3000,
                className: '',
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                success: {
                  style: {
                    background: '#10B981',
                    color: '#ffffff',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                    color: '#ffffff',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#EF4444',
                  },
                },
                loading: {
                  style: {
                    background: '#3B82F6',
                    color: '#ffffff',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#3B82F6',
                  },
                },
              }}
            />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
