import {Ellipsis, Pencil, Trash, Loader, Plus} from "lucide-react";
import Link from "next/link";
import React, {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import {List as ListType, TagColors} from "@/config/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  query,
  getDocs,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import {db} from "@/config/firebase";
import {Project as ProjectType} from "./app-sidebar";
import {useParams, useRouter} from "next/navigation";

export const ProjectsList = ({projects}: {projects: ProjectType[]}) => {
  const router = useRouter();
  const createProject = async () => {
    // create project in firebase

    const project = await addDoc(collection(db, "projects"), {
      name: "Untitled Project",
      models: [],
      createdAt: serverTimestamp(),
      usage: 0,
      color: TagColors[Math.floor(Math.random() * TagColors.length)],
    });
    router.push(`/chat/${project.id}`);
  };

  return (
    <div className="flex  w-full  flex-col gap-1 items-start">
      {projects.map((project, i) => (
        <Project
          key={project.id}
          project={project}
          index={i + 1}
          total={projects.length}
        />
      ))}

      <motion.button
        onClick={createProject}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{
          delay: (0.4 / projects.length) * (projects.length + 1),
        }}
        exit={{
          opacity: 0,
          transition: {
            delay:
              (0.4 / projects.length) *
              (projects.length - (projects.length + 1) - 1),
          },
        }}
        className="w-full h-fit text-[12px]  py-2 px-2 rounded-md hover:bg-muted-foreground/10 flex items-center"
      >
        <Plus className="h-4 w-4 mr-2  text-muted-foreground" />
        new project
      </motion.button>
    </div>
  );
};

const Project = ({
  project,

  index,
  total,
}: {
  project: ProjectType;
  index: number;
  total: number;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const ItemRef = React.useRef<HTMLDivElement>(null);
  const MenuRef = React.useRef(menuOpen);

  // get slug from url
  // const activeTab = false;
  const activeTab = useParams().projectId == project.id;

  React.useEffect(() => {
    const Item = ItemRef.current;
    if (Item === null) return;
    Item.addEventListener("mouseenter", () => {
      setHovered(true);
    });
    Item.addEventListener("mouseleave", () => {
      if (!MenuRef.current) {
        setHovered(false);
      }
    });

    return () => {
      Item.removeEventListener("mouseenter", () => {
        setHovered(true);
      });
      Item.removeEventListener("mouseleave", () => {
        if (!MenuRef.current) {
          setHovered(false);
        }
      });
    };
  }, []);

  React.useEffect(() => {
    MenuRef.current = menuOpen;
    if (!menuOpen) {
      setHovered(false);
    }
  }, [menuOpen]);

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const [openMenu, setOpenMenu] = React.useState(false);

  const [selectedColor, setSelectedColor] = React.useState<string>(
    project?.color || ""
  );

  const [name, setName] = useState<string>(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  const [isSaving, setIsSaving] = useState(false);

  const onSave = async () => {
    setIsSaving(true);
    updateDoc(doc(db, `projects/${project.id}`), {
      name: name,
      color: selectedColor,
    });
    setIsSaving(false);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const deleteProject = async () => {
    setIsDeleting(true);
    try {
      // Delete the list document
      await deleteDoc(doc(db, `projects/${project.id}`));

      // Query companies that contain the list.id in their lists array
      if (activeTab) {
        router.push("/dashboard");
      }
      setShowDeleteDialog(false);

      console.log("Project deleted and references removed successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
    setIsDeleting(false);
  };

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{delay: (0.4 / total) * index, duration: 0.1}}
      exit={{
        opacity: 0,
        transition: {delay: (0.4 / total) * (total - index - 1), duration: 0.1},
      }}
      ref={ItemRef}
      className={`relative  w-full   group overflow-hidden  rounded-lg   
      ${
        activeTab
          ? "bg-primary/10"
          : hovered
          ? "bg-primary/5"
          : "bg-transparent"
      }
  
      `}
    >
      <Link
        href={`/chat/${project.id}`}
        className="z-10 relative w-full py-2 px-2  grid-cols-[10px_1fr_6px] gap-2 grid items-center p-1 "
      >
        <span
          style={{backgroundColor: selectedColor}}
          className={`h-3 w-3 rounded-sm 
  
          `}
        ></span>
        <p className="poppins-regular text-left text-[12px] whitespace-nowrap flex-grow text-ellipsis max-w-full overflow-hidden text-primary relative z-10">
          {name}
        </p>
      </Link>

      <div
        className={`flex absolute right-0  px-2 z-20 h-full top-1/2  w-10 -translate-y-1/2   items-center justify-end
        ${hovered ? "opacity-100" : "opacity-0"}
        ${
          activeTab
            ? "project-hover-bg-gradient-active opacity-100"
            : "project-hover-bg-gradient"
        }
        `}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger>
            <Ellipsis className="h-4 w-4 text-primary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-border  ">
            <DropdownMenuItem
              onSelect={() => setOpenMenu(true)}
              className=" gap-2 cursor-pointer focus:bg-primary/20"
            >
              <Pencil className="h-4 w-4 " />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setShowDeleteDialog(true)}
              className="text-destructive cursor-pointer focus:bg-destructive/20 focus:text-destructive gap-2 "
            >
              <Trash className="h-4 w-4 " />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openMenu} onOpenChange={setOpenMenu}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename this list</DialogTitle>
              <DialogDescription>
                Rename your the list to something
              </DialogDescription>
            </DialogHeader>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card border-border"
              placeholder="Enter new name"
            />
            <div className="flex flex-col gap-2">
              <DialogTitle>Tag color</DialogTitle>
              <DialogDescription>
                Choose a color to tag this list
              </DialogDescription>
              <div className="flex gap-2 border border-border p-2 rounded-md w-fit">
                {TagColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-full border-2 hover:border-primary  
                  ${
                    selectedColor === color
                      ? "border-primary"
                      : "border-transparent"
                  }
                  
                  `}
                    style={{backgroundColor: color}}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant={"outline"} onClick={() => setOpenMenu(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSave();
                  setOpenMenu(false);
                }}
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                If you delete this list you will will not be able to get it back
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => {
                  // DeleteProject(project.id);
                  deleteProject();
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export const TagColors = [
  "#64748b",
  "#a1a1aa",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];
