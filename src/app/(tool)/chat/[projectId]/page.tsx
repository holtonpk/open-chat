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
      {/* <ChatHeader projectId={params.projectId} /> */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <>{project && <ChatBody project={project} />}</>
      )}
    </div>
  );
}
