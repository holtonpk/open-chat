"use client";

import {useState, useEffect} from "react";
import {Input} from "@/components/ui/input";
import {motion, AnimatePresence} from "framer-motion";
import {
  Search,
  Send,
  BarChart2,
  Globe,
  Video,
  PlaneTakeoff,
  AudioLines,
  Star,
  X,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  created: number;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
  };
}

interface SearchResult {
  actions: Action[];
}

function ActionSearchBar({
  actions,
  onSelect,
}: {
  actions: Action[];
  onSelect: (action: Action) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({actions: actions});
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions?.filter((action) => {
      const searchableText = action.name.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({actions: filteredActions});
  }, [debouncedQuery, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
  };

  const container = {
    hidden: {opacity: 0, height: 0},
    show: {
      opacity: 1,
      height: 200,
      width: 400,
      maxHeight: "fit-content",
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  };

  const item = {
    hidden: {opacity: 0, y: 20},
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Reset selectedAction when focusing the input
  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  const [favoriteModels, setFavoriteModels] = useState<string[]>([]);

  const toggleFavorite = (modelId: string) => {
    setFavoriteModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative flex flex-col justify-start items-center ">
        <div className="w-full max-w-sm sticky top-0  z-10 pt-4 pb-1">
          {/* <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
            htmlFor="search"
          >
            search for a model
          </label> */}
          <div className="relative">
            <div className="background  h-9 text-sm rounded-lg focus-visible:ring-offset-0 w-[400px] border">
              {selectedAction ? (
                <div className="flex gap-2 pl-3 pr-9 py-1.5">
                  <button onClick={() => setSelectedAction(null)}>
                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </button>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                    {selectedAction.name}
                  </span>
                </div>
              ) : (
                <Input
                  type="text"
                  placeholder="Search model..."
                  value={query}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0 w-[400px] border-none"
                />
              )}
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
              <AnimatePresence mode="popLayout">
                {!selectedAction && (
                  <motion.div
                    key="search"
                    initial={{y: -20, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    exit={{y: 20, opacity: 0}}
                    transition={{duration: 0.2}}
                  >
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence>
            {isFocused && result && !selectedAction && (
              <motion.div
                className="w-full overflow-y-scroll  border rounded-md shadow-sm  dark:border-gray-800 bg-white dark:bg-black mt-1"
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.ul>
                  {result.actions.map((action) => (
                    <motion.li
                      key={action.id}
                      className="px-3 py-2 flex items-center  justify-between hover:bg-gray-200 dark:hover:bg-zinc-900  cursor-pointer rounded-md"
                      variants={item}
                      layout
                      onClick={() => {
                        setSelectedAction(action);
                        onSelect(action);
                      }}
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                            {action.name}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(action.id)}>
                        <Star
                          className={`w-4 h-4 text-gray-400 dark:text-gray-500 hover:fill-yellow-400 hover:text-yellow-400 ${
                            favoriteModels.includes(action.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }`}
                        />
                      </button>
                      {/* <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {action.short}
                        </span>
                        <span className="text-xs text-gray-400 text-right">
                          {action.end}
                        </span>
                      </div> */}
                    </motion.li>
                  ))}
                </motion.ul>
                {/* <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Press ⌘K to open commands</span>
                    <span>ESC to cancel</span>
                  </div>
                </div> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export {ActionSearchBar};
