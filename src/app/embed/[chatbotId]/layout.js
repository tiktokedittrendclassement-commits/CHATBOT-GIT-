
import '../globals.css' // Import global styles for the widget

export const metadata = {
    title: 'Découvrez ce chatbot',
}

export default function EmbedLayout({ children }) {
    return (
        <html lang="fr">
            <body style={{ background: 'transparent' }}>
                {children}
            </body>
        </html>
    )
}
