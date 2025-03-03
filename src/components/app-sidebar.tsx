"use client";
import React, {useEffect, useState} from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {AnimatePresence, motion} from "framer-motion";
import {Bot, LayoutGrid, Loader} from "lucide-react";
import {ProjectsList} from "./projects-list";
import {ChevronDown} from "lucide-react";
import {List as ListIcon, Home as HomeIcon} from "lucide-react";
import {db} from "@/config/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {Model} from "@/lib/types";
import {TagColors} from "./projects-list";
import {useRouter} from "next/navigation";

export type Project = {
  id: string;
  name: string;
  color: string;
};

export function AppSidebar() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const projectsRef = collection(db, "projects");

    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const updatedProjects: Project[] = [];
      snapshot.docs.forEach((doc) => {
        updatedProjects.push({...doc.data(), id: doc.id} as Project);
      });
      setProjects(updatedProjects);
      setIsLoadingLists(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  console.log("projects", projects);

  const [isLoadingLists, setIsLoadingLists] = useState(true);

  const [showLists, setShowLists] = useState(true);

  const router = useRouter();

  const createProject = async (model: any) => {
    // create project in firebase
    const project = await addDoc(collection(db, "projects"), {
      name: "Untitled Project",
      models: [model],
      createdAt: serverTimestamp(),
      usage: 0,
      color: TagColors[Math.floor(Math.random() * TagColors.length)],
    });
    router.push(`/chat/${project.id}`);
  };

  return (
    <Sidebar>
      {/* <SidebarHeader>
        <Link href="/dashboard">Open UI</Link>
      </SidebarHeader> */}
      <SidebarContent className="gap-0 pt-4 ">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarGroupLabel>
              <Link
                href="/dashboard"
                className="py-2 px-2 rounded-md text-primary  font-bold flex justify-between w-full hover:bg-primary/5 items-end "
              >
                <h1 className="font-bold text-base flex items-center gap-1 ">
                  <HomeIcon className="h-5 w-5" />
                  Dashboard
                </h1>
              </Link>
            </SidebarGroupLabel>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="">
          <SidebarGroupContent>
            <SidebarGroupLabel>
              <h1 className="font-bold text-sm flex items-center gap-1  text-primary ">
                Presets
              </h1>
            </SidebarGroupLabel>
          </SidebarGroupContent>
          <SidebarGroupContent className="flex flex-col  ">
            {PresetModels.map((model) => (
              <button
                onClick={() => createProject(model.model)}
                key={model.model.id}
                className="py-2 px-2 rounded-md  font-bold flex justify-between w-full hover:bg-primary/5 items-end "
              >
                <h1 className="font-bold text-base flex items-center gap-1 ">
                  <div className="size-6 p-[2px] rounded-full bg-background border">
                    <img
                      src={model.image}
                      alt="preset"
                      className="size-full rounded-full "
                    />
                  </div>
                  {model.description}
                </h1>
              </button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="">
          <SidebarGroupContent className="p-0 ">
            <SidebarGroupLabel>
              <h1 className="font-bold text-sm flex items-center gap-1  text-primary">
                Projects
              </h1>
            </SidebarGroupLabel>
          </SidebarGroupContent>
          <SidebarGroupContent className="flex flex-col gap-2 p-0">
            {isLoadingLists ? (
              <Loader className="mx-auto h-5 w-5 mt-10 animate-spin col-span-2" />
            ) : (
              <AnimatePresence>
                <ProjectsList projects={projects} />
              </AnimatePresence>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

const PresetModels = [
  {
    description: "Reasoning",
    image: "https://openrouter.ai/images/icons/OpenAI.svg",
    model: {
      id: "openai/gpt-4.5-preview",
      name: "OpenAI: GPT-4.5 (Preview)",
      created: 1740687810,
      description:
        "GPT-4.5 (Preview) is a research preview of OpenAI’s latest language model, designed to advance capabilities in reasoning, creativity, and multi-turn conversation. It builds on previous iterations with improvements in world knowledge, contextual coherence, and the ability to follow user intent more effectively.\n\nThe model demonstrates enhanced performance in tasks that require open-ended thinking, problem-solving, and communication. Early testing suggests it is better at generating nuanced responses, maintaining long-context coherence, and reducing hallucinations compared to earlier versions.\n\nThis research preview is intended to help evaluate GPT-4.5’s strengths and limitations in real-world use cases as OpenAI continues to refine and develop future models. Read more at the [blog post here.](https://openai.com/index/introducing-gpt-4-5/)",
      context_length: 128000,
      architecture: {
        modality: "text+image->text",
        tokenizer: "GPT",
        instruct_type: null,
      },
      pricing: {
        prompt: "0.000075",
        completion: "0.00015",
        image: "0.108375",
        request: "0",
      },
      top_provider: {
        context_length: 128000,
        max_completion_tokens: 16384,
        is_moderated: true,
      },
      per_request_limits: null,
    },
  },
  {
    description: "Research",
    image: "https://openrouter.ai/images/icons/Perplexity.svg",
    model: {
      id: "perplexity/sonar",
      name: "Perplexity: Sonar",
      created: 1738013808,
      description:
        "Sonar is lightweight, affordable, fast, and simple to use — now featuring citations and the ability to customize sources. It is designed for companies seeking to integrate lightweight question-and-answer features optimized for speed.",
      context_length: 127072,
      architecture: {
        modality: "text->text",
        tokenizer: "Other",
        instruct_type: null,
      },
      pricing: {
        prompt: "0.000001",
        completion: "0.000001",
        image: "0",
        request: "0.005",
      },
      top_provider: {
        context_length: 127072,
        max_completion_tokens: null,
        is_moderated: false,
      },
      per_request_limits: null,
    },
  },
  {
    description: "Writing",
    image: "https://openrouter.ai/images/icons/Anthropic.svg",
    model: {
      id: "anthropic/claude-3.7-sonnet",
      name: "Anthropic: Claude 3.7 Sonnet",
      created: 1740422110,
      description:
        "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
      context_length: 200000,
      architecture: {
        modality: "text+image->text",
        tokenizer: "Claude",
        instruct_type: null,
      },
      pricing: {
        prompt: "0.000003",
        completion: "0.000015",
        image: "0.0048",
        request: "0",
      },
      top_provider: {
        context_length: 200000,
        max_completion_tokens: 128000,
        is_moderated: true,
      },
      per_request_limits: null,
    },
  },
];
