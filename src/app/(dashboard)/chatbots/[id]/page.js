
import ChatbotEditor from '@/components/dashboard/chatbot-editor'

export default async function EditChatbotPage({ params }) {
    const { id } = await params
    return <ChatbotEditor botId={id} />
}
