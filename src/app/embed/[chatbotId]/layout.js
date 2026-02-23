'use client'

import '../../globals.css'
import { useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function EmbedLayout({ children }) {
    useEffect(() => {
        // Set transparent background for the embed iframe
        document.body.style.background = 'transparent';
        document.body.classList.add('is-embed');

        return () => {
            // Restore default background and remove embed class when leaving
            document.body.style.background = '';
            document.body.classList.remove('is-embed');
        };
    }, []);

    return (
        <div className={inter.className}>
            {children}
        </div>
    );
}
