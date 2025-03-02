"use client";

import {db} from "@/config/firebase";
import {doc, onSnapshot} from "firebase/firestore";
import Markdown from "react-markdown";
import {useEffect, useState, use, Usable, useId} from "react";

import {ChatBody} from "./chat-body";
import {getDoc} from "firebase/firestore";
import {Loader} from "lucide-react";
import Link from "next/link";
import {ProjectFull} from "@/lib/types";

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function ChatPage({params}: PageProps) {
  const [project, setProject] = useState<ProjectFull | null>(null);
  const unwrappedParams = use(params as unknown as Usable<{projectId: string}>);
  const projectId = unwrappedParams.projectId;

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        setProject({
          ...(doc.data() as ProjectFull),
          id: projectId,
        });
      } else {
        setProject({
          id: projectId,
          name: "New Project",
          color: "#000000",
          messages: [],
          createdAt: Date.now(),
          models: [],
          usage: 0,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  console.log("pp", project);

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader projectId={params.projectId} />
      <ChatBody projectId={params.projectId} />
    </div>
  );
}

const Project = ({project}: {project: ProjectFull}) => {
  const chat = {
    id: "gen-1740870460-lmMGezRTxRaWiNUEX15P",
    provider: "Perplexity",
    model: "perplexity/sonar",
    object: "chat.completion",
    created: 1740870460,
    choices: [
      {
        logprobs: null,
        finish_reason: "stop",
        native_finish_reason: "stop",
        index: 0,
        message: {
          role: "assistant",
          content:
            'There appear to be two different companies using the name "Morty" with distinct business models and investment profiles:\n\n1. **Morty Mortgage Platform**: This company has raised a total of $37.45 million over six rounds, with the latest round being a Series B for $25 million in July 2021[3].\n\n2. **Morty Experience App**: This app has raised a total of $3.5 million, with a recent Series Seed funding round of $2.2 million[2][4]. \n\nBoth figures pertain to different applications of the name, so it\'s important to identify which specific Morty app you are referring to.',
          refusal: null,
        },
      },
    ],
    citations: [
      "https://www.siliconrepublic.com/start-ups/morty-investment-series-a",
      "https://www.planetattractions.com/news/Experience-app-Morty-raises-US$2.2m-as-platform-expands-into-haunted-attractions-market/2872",
      "https://www.cbinsights.com/company/morty/financials",
      "https://morty.app/blog/seed-round",
      "https://www.prnewswire.com/news-releases/online-mortgage-marketplace-morty-raises-25m-in-series-b-funding-301333446.html",
    ],
    usage: {prompt_tokens: 9, completion_tokens: 137, total_tokens: 146},
  };

  const getFaviconUrl = (url: string) => {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  };

  // const getPageDescription = async (url: string) => {
  //   // get the page description from the url
  //   const domain = new URL(url).hostname;

  //   const response = await fetch(domain);
  //   const html = await response.text();
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(html, "text/html");
  //   const description = doc
  //     .querySelector("meta[name='description']")
  //     ?.getAttribute("content");
  //   return description;
  // };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <h1>{project.name}</h1>
      <div className="flex flex-col gap-2">
        {chat.choices.map((choice) => (
          <div key={choice.index}>
            {/* Render markdown */}
            <div className="prose markdown">
              <Markdown>{choice.message.content}</Markdown>
            </div>
            <div className="flex flex-wrap gap-2">
              {chat.citations.map((citation) => (
                <Link
                  key={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={citation}
                  className="p-2 border rounded-md flex items-center gap-2 hover:bg-muted-foreground/10"
                >
                  <img
                    src={getFaviconUrl(citation)}
                    alt={citation}
                    className="w-4 h-4"
                  />
                  {citation}
                  <span className="text-sm text-muted-foreground">
                    {/* {getPageDescription(citation)} */}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
