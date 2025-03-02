"use client";

import {db} from "@/config/firebase";
import {doc, onSnapshot} from "firebase/firestore";
import Markdown from "react-markdown";
import {useEffect, useState} from "react";

import {ChatBody} from "./chat-body";
import {getDoc} from "firebase/firestore";
import {Loader} from "lucide-react";
import Link from "next/link";
import {ProjectFull} from "@/lib/types";

const ChatPage = async ({params}: {params: {projectId: string}}) => {
  const [project, setProject] = useState<ProjectFull | null>(null);
  const projectId = params.projectId;

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
    <div className="w-full relative overflow-hidden">
      {project && !loading ? (
        // <Project project={project} />
        <ChatBody project={project} />
      ) : (
        <div className="w-full h-screen flex flex-col items-center justify-center">
          <Loader className="w-10 h-10 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
