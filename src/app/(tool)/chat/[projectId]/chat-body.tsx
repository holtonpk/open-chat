"use client";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {useState, FormEvent, useEffect, useRef} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Bot,
  Paperclip,
  Mic,
  CornerDownLeft,
  Plus,
  Copy,
  Trash,
  Edit,
  RefreshCcw,
  Pencil,
  Check,
  Globe,
} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import {ChatInput} from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import {ChatMessageList} from "@/components/ui/chat-message-list";
import {ProjectFull, Model, Message} from "@/lib/types";
import {EmptyChat} from "@/app/(tool)/chat/[projectId]/empty-chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import Markdown from "react-markdown";
import {db} from "@/config/firebase";
import {arrayRemove, doc, updateDoc, getDocs, getDoc} from "firebase/firestore";
import {collection} from "firebase/firestore";
import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
export function ChatBody({project}: {project: ProjectFull}) {
  const [isOnline, setIsOnline] = useState(false);

  const [messages, setMessages] = useState<Message[]>(project.messages || []);

  const [savedProviders, setSavedProviders] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<
    Array<{modelId: string; img: string}>
  >([]);

  const [currentUsage, setCurrentUsage] = useState(project.usage || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachFile = () => {
    //
  };

  const handleMicrophoneClick = () => {
    //r.jina
  };

  const getProviderImg = (providerName: string) => {
    return savedProviders.find((provider) => provider.id === providerName)?.img;
  };

  useEffect(() => {
    const fetchSavedProviders = async () => {
      const modelsRef = collection(db, "models");
      const querySnapshot = await getDocs(modelsRef);
      querySnapshot.docs.forEach((doc) => {
        setSavedProviders((prev) => [
          ...prev,
          {id: doc.id, img: doc.data().img},
        ]);
      });
    };
    fetchSavedProviders();
  }, []);

  const updateProject = async (additionalUsage: number) => {
    const newUsage = currentUsage + additionalUsage;
    setCurrentUsage(newUsage);

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      usage: newUsage,
    });
  };

  const sendMessage = async (message: string) => {
    const createMessage = (
      content: string,
      role: "user" | "assistant",
      model: Model,
      usage = 0,
      citations?: string[]
    ) => {
      if (citations && citations.length > 0) {
        return {
          id: Math.random().toString(36).substring(2, 8),
          content,
          role,
          model,
          usage,
          citations,
        } as Message;
      } else {
        return {
          id: Math.random().toString(36).substring(2, 8),
          content,
          role,
          model,
          usage,
        } as Message;
      }
    };

    const safeMessages = Array.isArray(messages) ? messages : [];

    const newUserMessage = createMessage(message, "user", project.models[0]);
    setMessages([...safeMessages, newUserMessage]);

    setLoadingStates(
      project.models.map((model) => ({
        modelId: model.id,
        img: getProviderImg(model.id.split("/")[0]),
      }))
    );

    try {
      const modelPromises = project.models.map(async (model) => {
        const response = await fetch("/api/open-router", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            messages: [...safeMessages, {role: "user", content: message}].map(
              (m) => ({
                role: m.role,
                content: m.content,
              })
            ),
            model: model.id,
            isOnline,
          }),
        });

        const data = await response.json();
        const promptTokens = data.usage.prompt_tokens;
        const completion_tokens = data.usage.completion_tokens;
        const totalPrice =
          promptTokens * model.pricing.prompt +
          completion_tokens * model.pricing.completion;

        await updateProject(totalPrice);
        return createMessage(
          data.message.content,
          "assistant",
          model,
          data.usage,
          data.citations
        );
      });

      const newAssistantMessages = await Promise.all(modelPromises);

      // Update messages with responses
      setMessages([...safeMessages, newUserMessage, ...newAssistantMessages]);

      // Update Firestore
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        messages: [...safeMessages, newUserMessage, ...newAssistantMessages],
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoadingStates([]);
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = (message: Message) => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleRetry = (message: Message) => {
    // Find the index of the message to retry
    const messageIndex = messages.findIndex((m) => m.id === message.id);

    // Keep only messages before the selected message
    const messagesToKeep = messages.slice(0, messageIndex);

    // Update Firestore and local state
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, {
      messages: messagesToKeep,
    });
    setMessages(messagesToKeep);

    // Send message again
    sendMessage(message.content);
  };

  const handleDelete = (message: Message) => {
    // delete from firestore
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, {
      messages: messages.filter((m) => m.id !== message.id),
    });
    setMessages(messages.filter((m) => m.id !== message.id));
  };

  const [isScrolled, setIsScrolled] = useState(false);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (scrollLeft !== 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const handleOverflow = () => {
      const container = document.getElementById("models-container");
      if (container) {
        setIsOverflowing(container.scrollWidth > container.clientWidth);
      }
    };

    // Check initially
    handleOverflow();

    // Add resize observer to check when container size changes
    const resizeObserver = new ResizeObserver(handleOverflow);
    const container = document.getElementById("models-container");
    if (container) {
      resizeObserver.observe(container);
    }

    // Cleanup
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  const getFaviconUrl = (url: string) => {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  };

  // wait 2 seconds after the first message has been sent and then generate a name for the chat

  const generateName = async () => {
    const response = await fetch("/api/generate-name", {
      method: "POST",
      body: JSON.stringify({
        messages: messages.map((m) => ({
          content: m.content,
          role: m.role,
        })),
      }),
    });
    const data = await response.json();
    console.log("generated name ======>", data);
    updateDoc(doc(db, "projects", project.id), {
      name: data.name,
    });
  };

  useEffect(() => {
    if (messages.length > 0 && project.name === "Untitled Project") {
      setTimeout(() => {
        generateName();
      }, 2000);
    }
  }, [messages]);

  return (
    <div className=" w-full  flex flex-col relative h-screen overflow-hidden ">
      {messages && messages.length > 0 ? (
        <>
          <ExpandableChat>
            <ExpandableChatHeader className="flex flex-row text-center h-[60px] ">
              <div className="flex gap-2 items-center ">
                <div className="relative w-fit">
                  {isScrolled && (
                    <div className="absolute left-0 h-full  z-30 animate-in fade-in-0 duration-500 pointer-events-none">
                      <div className="models-row-edge-grad-left h-full w-20 z-30 pointer-events-none"></div>
                    </div>
                  )}
                  {isOverflowing && (
                    <div className="absolute right-0 h-full z-30 animate-in fade-in-0 duration-500 pointer-events-none">
                      <div className="models-row-edge-grad-right h-full w-20 z-30 pointer-events-none"></div>
                    </div>
                  )}
                  <div
                    id="models-container"
                    className={` max-w-[600px] overflow-scroll flex gap-2  relative
                        ${isOverflowing ? "pr-20" : ""}
                        `}
                    onScroll={onScroll}
                  >
                    {project.models.map((model) => (
                      <ChatModel
                        key={model.id}
                        model={model}
                        project={project}
                      />
                    ))}
                  </div>
                </div>

                <ModelSelector
                  savedProviders={savedProviders}
                  project={project}
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-sm text-muted-foreground">
                  Chat Cost: ${currentUsage.toFixed(3)}
                </div>
              </div>
              {project.name}
            </ExpandableChatHeader>

            <ExpandableChatBody className="relative z-20 pb-36 w-full overflow-y-scroll h-[calc(100vh-60px)]">
              <ChatMessageList className="">
                <div className="w-[800px] mx-auto flex flex-col gap-8">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      variant={message.role === "user" ? "sent" : "received"}
                    >
                      <ChatBubbleAvatar
                        className="h-8 w-8 shrink-0 "
                        src={
                          message.role === "user"
                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                            : getProviderImg(message.model.id.split("/")[0])
                        }
                        fallback={message.role === "user" ? "US" : "AI"}
                      />
                      <ChatBubbleMessage
                        className="markdown relative group"
                        variant={message.role === "user" ? "sent" : "received"}
                      >
                        {message.role == "assistant" ? (
                          <Markdown>{message.content}</Markdown>
                        ) : (
                          message.content
                        )}
                        {message.citations && (
                          <div className="flex flex-wrap gap-2">
                            {message.citations.map((citation) => (
                              <Link
                                key={citation}
                                target="_blank"
                                href={citation}
                                className="p-2 border bg-background rounded-md grid grid-cols-[16px_1fr] h-fit items-center gap-2  whitespace-nowrap "
                              >
                                <img
                                  src={getFaviconUrl(citation)}
                                  alt={citation}
                                  className="w-4 h-4"
                                />
                                {citation}
                              </Link>
                            ))}
                          </div>
                        )}
                        <div className="items-center gap-1 absolute -bottom-2 translate-y-full left-0 text-muted-foreground opacity-0 group-hover:opacity-100 flex z-10  p-1 rounded-md transition-opacity">
                          <TooltipProvider>
                            <Tooltip delayDuration={400}>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleCopy(message)}
                                  variant="ghost"
                                  size="icon"
                                >
                                  {isCopied ? (
                                    <Check className="size-4" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip delayDuration={400}>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleDelete(message)}
                                  variant="ghost"
                                  size="icon"
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {message.role === "user" && (
                            <TooltipProvider>
                              <Tooltip delayDuration={400}>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => handleRetry(message)}
                                    variant="ghost"
                                    size="icon"
                                  >
                                    <RefreshCcw className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Retry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}

                  {loadingStates.map((loadingState) => (
                    <ChatBubble key={loadingState.modelId} variant="received">
                      <ChatBubbleAvatar
                        className="h-8 w-8 shrink-0"
                        src={loadingState.img}
                        fallback="AI"
                      />
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  ))}
                </div>
              </ChatMessageList>
            </ExpandableChatBody>
          </ExpandableChat>
          <form
            onSubmit={handleSubmit}
            className=" rounded-lg border  bg-background   p-1 absolute z-[50] focus-within:shadow-xl bottom-10 w-[800px] left-1/2 -translate-x-1/2 shadow-lg"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-12 resize-none rounded-lg bg-transparent  border-0 p-3 shadow-none focus-visible:ring-0  "
            />
            <div className="flex items-center p-3 pt-0 justify-end gap-4">
              <div className="flex">
                {/* <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleAttachFile}
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleMicrophoneClick}
                >
                  <Mic className="size-4" />
                </Button> */}
              </div>
              <Button
                onClick={() => setIsOnline(!isOnline)}
                variant="outline"
                type="button"
                className={`ml-auto transition-all duration-300 ${
                  isOnline
                    ? "bg-blue-500/20 border-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:border-blue-500/30 hover:text-blue-500"
                    : ""
                } gap-1`}
              >
                <Globe className="size-4" />
                Web Search
              </Button>
              <Button type="submit" size="sm" className=" gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </>
      ) : (
        <EmptyChat
          project={project}
          savedProviders={savedProviders}
          onSubmit={sendMessage}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
        />
      )}
    </div>
  );
}

export const ModelSelector = ({
  savedProviders,
  project,
}: {
  savedProviders: any[];
  project: ProjectFull;
}) => {
  const [models, setModels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  type savedProvider = {
    id: string;
    img: string;
  };

  useEffect(() => {
    const fetchModels = async () => {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      const data = await response.json();
      setModels(data.data);
    };
    fetchModels();
  }, []);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [hoveredModel, setHoveredModel] = useState<Model | null>(
    filteredModels[0]
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMouseEnter = (model: Model) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set new timeout
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredModel(model);
    }, 100);
  };

  const handleMouseLeave = () => {
    // Clear timeout when mouse leaves
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleAddModel = (model: Model) => {
    // add to firestore
    console.log(model);
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, {
      models: [...project.models, model],
    });
    setOpen(false);
  };

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Plus className="size-4" />
          <span>Add Model</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Model Selection</DialogTitle>
        <div className="flex flex-col ">
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="col-span-3 border-none focus-visible:ring-0 shadow-none py-4  h-12"
          />
          <div className="grid grid-cols-2 gap-2 w-full divide-border divide-x border-t ">
            <div className="h-[500px] overflow-y-auto p-2">
              <span className="font-bold text-[14px] px-2 text-muted-foreground">
                Models
              </span>
              {filteredModels.map((model) => (
                <button
                  onClick={() => handleAddModel(model)}
                  onMouseEnter={() => handleMouseEnter(model)}
                  onMouseLeave={handleMouseLeave}
                  key={model.id}
                  className={`items-center justify-between px-2 py-1 hover:bg-muted rounded-lg cursor-pointer gap-2 grid grid-cols-[24px_1fr_36px] w-full
                    ${
                      hoveredModel?.id === model.id
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  <img
                    src={
                      savedProviders &&
                      savedProviders.find((provider) =>
                        model.id.includes(provider.id)
                      )?.img
                        ? savedProviders.find((provider) =>
                            model.id.includes(provider.id)
                          )?.img
                        : ""
                    }
                    alt={model.name}
                    className="h-6 w-6"
                  />

                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis text-left">
                    {model.name}
                  </div>

                  <span className="ml-auto">
                    <Plus className="size-4" />
                  </span>
                </button>
              ))}
            </div>
            {hoveredModel ? (
              <div className="h-[500px] max-w-full overflow-y-auto  flex items-center flex-col p-4 gap-2">
                <img
                  src={
                    savedProviders &&
                    savedProviders.find((provider) =>
                      hoveredModel.id.includes(provider.id)
                    )?.img
                  }
                  alt={hoveredModel.name}
                  className="h-12 w-12"
                />
                <div className="font-medium text-xl">{hoveredModel.name}</div>
                <div className="flex gap-2 text-muted-foreground text-sm  rounded-md max-w-full flex-wrap">
                  <p className="whitespace-nowrap text-muted-foreground text-sm rounded-md bg-muted p-2">
                    Created{" "}
                    {new Date(hoveredModel?.created * 1000).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                  <p className="whitespace-nowrap bg-muted p-2 rounded-md">
                    {hoveredModel?.context_length >= 1000000
                      ? `${(hoveredModel?.context_length / 1000000).toFixed(
                          1
                        )}M`
                      : hoveredModel?.context_length >= 1000
                      ? `${(hoveredModel?.context_length / 1000).toFixed(0)}k`
                      : hoveredModel?.context_length}{" "}
                    context
                  </p>

                  <p className="whitespace-nowrap bg-muted p-2 rounded-md">
                    ${(hoveredModel?.pricing.prompt * 1000000).toFixed(0)}
                    /M input tokens
                  </p>

                  <p className="whitespace-nowrap bg-muted p-2 rounded-md">
                    ${(hoveredModel?.pricing.completion * 1000000).toFixed(0)}
                    /M output tokens
                  </p>
                </div>
                <div className="text-sm text-muted-foreground max-w-full h-fit   markdown">
                  {/* render markdown */}
                  <Markdown>{hoveredModel.description}</Markdown>
                </div>
              </div>
            ) : (
              <div className="w-full"></div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ChatModel = ({
  model,
  project,
}: {
  model: Model;
  project: ProjectFull;
}) => {
  const [providerImg, setProviderImg] = useState<string>("");

  useEffect(() => {
    const fetchProviderData = async () => {
      //   fetch from firestore
      const data = await getDoc(doc(db, "models", model.id.split("/")[0]));
      setProviderImg(data.data()?.img);
    };
    fetchProviderData();
  }, []);

  const handleDelete = () => {
    // delete from firestore
    // update the project doc in firestore
    console.log(project.id);
    const updatedModels = project.models.filter((m) => m.id !== model.id);

    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, {
      models: updatedModels,
    });
  };

  return (
    <div className="flex items-center  border rounded-md p-2 gap-2 bg-background">
      <Avatar className="h-8 w-8 rounded-full  overflow-hidden p-1 shadow-sm  border">
        <AvatarImage src={providerImg} />
      </Avatar>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {model.name}
      </div>
      <button
        onClick={handleDelete}
        className="flex items-center justify-center hover:bg-muted rounded-full transition-all duration-300 p-1"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
