import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'DevUtils Desktop — Premium Mac Toolkit',
    description: 'Free Mac optimizer: clean junk, monitor system, scan disk, manage processes and ports. Built for developers on macOS.',
    keywords: ['mac cleaner', 'mac optimizer', 'disk cleaner', 'process manager', 'macos app'],
    openGraph: {
        title: 'DevUtils Desktop — Premium Mac Toolkit',
        description: 'Free Mac optimizer: Clean, Monitor, Optimize. Built for developers.',
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    )
}
