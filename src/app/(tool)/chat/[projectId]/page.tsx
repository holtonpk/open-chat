import ChatWrapper from "./chat-wrapper";
const ChatPage = async ({params}: {params: {projectId: string}}) => {
  return <ChatWrapper projectId={params.projectId} />;
};

export default ChatPage;
