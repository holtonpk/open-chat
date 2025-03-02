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
import {Loader} from "lucide-react";
import {ProjectsList} from "./projects-list";
import {ChevronDown} from "lucide-react";
import {List as ListIcon, Home as HomeIcon} from "lucide-react";
import {db} from "@/config/firebase";
import {collection, onSnapshot} from "firebase/firestore";

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

  const [isLoadingLists, setIsLoadingLists] = useState(true);

  const [showLists, setShowLists] = useState(true);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard">Open UI</Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>
              <Link
                href="/dashboard"
                className="py-2 px-2 rounded-md  font-bold flex justify-between w-full hover:bg-primary/5 items-end "
              >
                <h1 className="font-bold text-base flex items-center gap-1 ">
                  <HomeIcon className="h-5 w-5" />
                  Dashboard
                </h1>
              </Link>
            </SidebarGroupLabel>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>
              <button
                onClick={() => setShowLists(!showLists)}
                className="py-2 px-2 rounded-md  font-bold flex justify-between w-full hover:bg-primary/5 items-end "
              >
                <h1 className="font-bold text-base flex items-center gap-1 ">
                  <ListIcon className="h-5 w-5" />
                  Projects
                </h1>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground mb-1 transition-transform duration-300
          ${showLists ? "rotate-180" : "rotate-0"}
          
          `}
                />
              </button>
            </SidebarGroupLabel>
          </SidebarGroupContent>
          <SidebarGroupContent className="flex flex-col gap-2">
            <div className="grid grid-cols-[10px_1fr] pl-[18px]">
              {isLoadingLists ? (
                <Loader className="mx-auto h-5 w-5 mt-10 animate-spin col-span-2" />
              ) : (
                <>
                  <AnimatePresence>
                    {showLists && (
                      <>
                        <motion.div
                          initial={{height: 0}}
                          animate={{height: "100%"}}
                          exit={{height: 0}}
                          transition={{duration: 0.2}}
                          className="h-full w-[1px] bg-muted-foreground/20"
                        ></motion.div>

                        <ProjectsList projects={projects} />
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
