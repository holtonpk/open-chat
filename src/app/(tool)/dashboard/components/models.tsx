"use client";

import {useEffect, useState, use, Usable, useId} from "react";
import {
  getDoc,
  doc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {Input} from "@/components/ui/input";
import {db} from "@/config/firebase";
import {Loader2, Plus, Search, Trash, Copy} from "lucide-react";
import {ActionSearchBar} from "@/components/action-search-bar";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {RainbowButton} from "@/components/ui/rainbow-button";

import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Check, ChevronDown} from "lucide-react";
import {X} from "lucide-react";
import {useRouter} from "next/navigation";

import {ProjectFull} from "@/lib/types";
import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
import Markdown from "react-markdown";
import {TagColors} from "@/components/projects-list";
export const Models = () => {
  const [models, setModels] = useState<any[]>([]);
  const [savedProviders, setSavedProviders] = useState<any[]>([]);
  useEffect(() => {
    const fetchModels = async () => {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      const data = await response.json();
      setModels(data.data);
    };
    const fetchSavedProviders = async () => {
      const modelsRef = collection(db, "models");
      const querySnapshot = await getDocs(modelsRef);
      setSavedProviders(querySnapshot.docs.map((doc) => doc.data()));
    };
    fetchModels();
    fetchSavedProviders();
  }, []);

  const [showMore, setShowMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const router = useRouter();

  return (
    <div className="w-full  flex flex-col  min-h-screen relative items-center  pb-4 mt-4">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="background  h-9 text-sm rounded-lg focus-visible:ring-offset-0 w-[400px] border relative">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute  left-2 top-1/2 mt-[2px] -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            ) : (
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            )}

            <Input
              type="text"
              placeholder="Search model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0 w-[400px] border-none "
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {filteredModels.slice(0, displayCount).map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              savedProviders={savedProviders}
            />
          ))}
        </div>
        {displayCount < filteredModels.length && (
          <Button
            onClick={() => setDisplayCount((prev) => prev + 6)}
            variant="ghost"
            className="self-center mt-4 "
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  );
};

const ModelCard = ({
  model,
  savedProviders,
}: {
  model: any;
  savedProviders: any[];
}) => {
  const router = useRouter();
  const createProject = async () => {
    // create project in firebase

    const project = await addDoc(collection(db, "projects"), {
      name: "Untitled Project",
      models: [model],
      createdAt: serverTimestamp(),
      usage: 0,
      color: TagColors[Math.floor(Math.random() * TagColors.length)],
    });
    return project;
  };

  const createProjectWithModel = async () => {
    const project = await createProject();
    router.push(`/chat/${project.id}`);
  };

  const copyModelObject = () => {
    navigator.clipboard.writeText(
      JSON.stringify({
        image:
          savedProviders &&
          savedProviders.find((provider) => model.id.includes(provider.id))
            ?.img,
        model,
      })
    );
  };

  return (
    <div
      className={`flex flex-col gap-2 w-full h-full items-start  border rounded-md p-4 bg-background shadow-md `}
    >
      <button onClick={copyModelObject}>
        <Copy className="w-4 h-4" />
      </button>
      <div className="grid grid-cols-[32px_1fr] gap-2 items-start">
        <Avatar className="h-8 w-8 mx-auto border rounded-full  overflow-hidden p-1 shadow-sm mt-1">
          <AvatarImage
            className="rounded-full"
            src={
              savedProviders &&
              savedProviders.find((provider) => model.id.includes(provider.id))
                ?.img
            }
          />
        </Avatar>

        <h1 className="text-2xl font-bold ">{model.name}</h1>
      </div>

      <div className="flex gap-2 text-muted-foreground text-sm  rounded-md max-w-full flex-wrap">
        <p className="whitespace-nowrap text-muted-foreground text-sm rounded-md bg-muted p-2">
          Created{" "}
          {new Date(model?.created * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="whitespace-nowrap bg-muted p-2 rounded-md">
          {model?.context_length >= 1000000
            ? `${(model?.context_length / 1000000).toFixed(1)}M`
            : model?.context_length >= 1000
            ? `${(model?.context_length / 1000).toFixed(0)}k`
            : model?.context_length}{" "}
          context
        </p>

        <p className="whitespace-nowrap bg-muted p-2 rounded-md">
          ${(model?.pricing.prompt * 1000000).toFixed(0)}/M input tokens
        </p>

        <p className="whitespace-nowrap bg-muted p-2 rounded-md">
          ${(model?.pricing.completion * 1000000).toFixed(0)}/M output tokens
        </p>
      </div>

      <div
        className={`flex flex-col items-start h-[60px] relative  w-full
         
        `}
      >
        {/* make this a popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "text-sm text-muted-foreground bg-background max-w-full text-left hover:text-primary  transition-all duration-300  max-h-[120px] line-clamp-3 markdown"
              )}
            >
              <Markdown>{model?.description}</Markdown>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[800px] markdown">
            <Markdown>{model?.description}</Markdown>
          </PopoverContent>
        </Popover>
      </div>
      {/* {selectedModels.includes(model) ? (
        <Button
          variant="secondary"
          onClick={() => toggleModel(model)}
          className=" mt-auto w-full"
        >
          <Trash className="w-4 h-4" />
          remove from project
        </Button>
      ) : (
        <Button
          onClick={() => toggleModel(model)}
          variant="outline"
          className=" bg-blue-500 text-white w-full hover:bg-blue-600 hover:text-white mt-auto"
        >
          <Plus className="w-4 h-4" />
          Add to project
        </Button>
      )} */}
      <RainbowButton
        onClick={createProjectWithModel}
        className="w-full mt-auto "
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Project
      </RainbowButton>
    </div>
  );
};
