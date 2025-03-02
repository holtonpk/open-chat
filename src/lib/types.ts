export type ProjectFull = {
  id: string;
  name: string;
  color: string;
  messages: Message[];
  createdAt: number;
  models: Model[];
  usage: number;
};

export type Message = {
  id: string;
  model: Model;
  content: string;
  role: "user" | "assistant";
  usage: number;
  citations?: string[];
};

type Usage = {
  model: Model;
  token: number;
};

export type Model = {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  created: number;
};
