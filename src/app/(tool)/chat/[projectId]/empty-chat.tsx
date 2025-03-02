"use client";

import {useEffect, useRef, useCallback} from "react";
import {ChatModel, ModelSelector} from "./chat-body";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  Figma,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
  Globe,
} from "lucide-react";
import {ProjectFull} from "@/lib/types";
interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return {textareaRef, adjustHeight};
}

export function EmptyChat({
  project,
  savedProviders,
  onSubmit,
  isOnline,
  setIsOnline,
}: {
  project: ProjectFull;
  savedProviders: any[];
  onSubmit: (message: string) => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const {textareaRef, adjustHeight} = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        setValue("");
        adjustHeight(true);
        onSubmit(value);
      }
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-black dark:text-white">
        What can I help with?
      </h1>
      <div className="w-full">
        <div className="relative  rounded-xl  border bg-background">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-primary text-3xl",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground placeholder:text-base",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            {/* <div className="flex items-center gap-2">
              <Button variant="outline" type="button">
                <Paperclip className="w-4 h-4 " />
                <span className="text-xs ">Attach</span>
              </Button>
            </div> */}

            <Button
              onClick={() => setIsOnline(!isOnline)}
              variant="outline"
              type="button"
              className={` transition-all duration-300 ${
                isOnline
                  ? "bg-blue-500/20 border-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:border-blue-500/30 hover:text-blue-500"
                  : ""
              } gap-1`}
            >
              <Globe className="size-4" />
              Web Search
            </Button>
            <Button onClick={() => onSubmit(value)}>
              <ArrowUpIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="flex gap-2 items-center flex-wrap">
            {project.models.map((model) => (
              <ChatModel key={model.id} model={model} project={project} />
            ))}
            <ModelSelector savedProviders={savedProviders} project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
