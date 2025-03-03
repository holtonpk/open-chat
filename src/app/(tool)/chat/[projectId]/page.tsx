import ChatWrapper from "./chat-wrapper";

interface PageProps {
  params: {
    projectId: string;
  };
  searchParams?: {[key: string]: string | string[] | undefined};
}

const ChatPage = async ({params}: PageProps) => {
  return <ChatWrapper projectId={params.projectId} />;
};

export default ChatPage;
