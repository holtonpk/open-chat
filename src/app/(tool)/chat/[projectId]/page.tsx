import ChatWrapper from "./chat-wrapper";

// Using a different name to avoid conflicts with existing types
interface ChatPageProps {
  params: {
    projectId: string;
  };
  searchParams?: {[key: string]: string | string[] | undefined};
}

const ChatPage = async ({params}: ChatPageProps) => {
  return <ChatWrapper projectId={params.projectId} />;
};

export default ChatPage;
