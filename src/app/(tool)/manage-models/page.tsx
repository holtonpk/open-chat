"use client";

import React, {useEffect, useState} from "react";
import {Model} from "@/lib/types";
import {collection, doc, getDoc, setDoc, getDocs} from "firebase/firestore";
import {addDoc} from "firebase/firestore";
import {db} from "@/config/firebase";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
type Provider = {
  provider: string;
  models: Model[];
  isSaved: boolean; // Add this field
};

const ManagePage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [savedProviders, setSavedProviders] = useState<Set<string>>(new Set());
  const [modelProviders, setModelProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      const data = await response.json();
      setModels(data.data);
    };

    const fetchSavedProviders = async () => {
      const modelsRef = collection(db, "models");
      const querySnapshot = await getDocs(modelsRef);
      setSavedProviders(new Set(querySnapshot.docs.map((doc) => doc.id)));
    };

    const initializeData = async () => {
      await Promise.all([fetchModels(), fetchSavedProviders()]);
    };

    initializeData();
  }, []);

  useEffect(() => {
    // Only process when both models and savedProviders are available
    if (models.length > 0) {
      const providers = models.reduce((acc: Provider[], model) => {
        const provider = model.id.split("/")[0];
        const existingProvider = acc.find((p) => p.provider === provider);

        if (existingProvider) {
          existingProvider.models.push(model);
        } else {
          acc.push({
            provider,
            models: [model],
            isSaved: savedProviders.has(provider),
          });
        }

        return acc;
      }, []);

      setModelProviders(providers);
    }
  }, [models, savedProviders]);

  // Sort providers - unsaved first, then saved
  const sortedProviders = [...modelProviders].sort((a, b) => {
    return a.isSaved === b.isSaved ? 0 : a.isSaved ? 1 : -1;
  });

  return (
    <div className="w-full flex flex-col gap-2">
      {sortedProviders.map((provider, i) => (
        <ModelCard
          key={provider.provider}
          modelProvider={provider.provider}
          models={provider.models}
          onSaveStateChange={(isSaved) => {
            const newSavedProviders = new Set(savedProviders);
            if (isSaved) {
              newSavedProviders.add(provider.provider);
            } else {
              newSavedProviders.delete(provider.provider);
            }
            setSavedProviders(newSavedProviders);

            // Update the provider's saved state in modelProviders
            setModelProviders((prevProviders) =>
              prevProviders.map((p) =>
                p.provider === provider.provider ? {...p, isSaved} : p
              )
            );
          }}
        />
      ))}
    </div>
  );
};

export default ManagePage;

const ModelCard = ({
  modelProvider,
  models,
  onSaveStateChange,
}: {
  modelProvider: string;
  models: Model[];
  onSaveStateChange: (isSaved: boolean) => void;
}) => {
  const [isInDb, setIsInDb] = useState(false);

  const [img, setImg] = useState("undefined");

  const saveModel = async () => {
    const modelData = {
      id: modelProvider,
      img: img,
    };

    const modelRef = doc(collection(db, "models"), modelProvider);
    await setDoc(modelRef, modelData);
    setIsInDb(true);
    onSaveStateChange(true);
  };

  useEffect(() => {
    const checkIfInDb = async () => {
      const modelRef = collection(db, "models");
      const docRef = doc(modelRef, modelProvider);
      const querySnapshot = await getDoc(docRef);
      if (querySnapshot.exists()) {
        setIsInDb(true);
        setImg(querySnapshot.data()?.img);
        onSaveStateChange(true);
      } else {
        setImg(await getModelIcon());
      }
    };
    checkIfInDb();
  }, []);

  const getModelIcon = async () => {
    const modelId = models[0].name.split(":")[0];
    const modelProvider = models[0].id.split("/")[0].replace("-", "");
    const providerBase = modelProvider.split("ai")[0];
    if (modelId == "Meta") {
      return "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://ai.meta.com/&size=256";
    }
    // Try SVG first
    const svgUrl = `https://openrouter.ai/images/icons/${modelId}.svg`;
    try {
      const svgResponse = await fetch(svgUrl);
      if (svgResponse.ok) return svgUrl;
    } catch (error) {
      // Continue to next option
    }

    // Try PNG
    const pngUrl = `https://openrouter.ai/images/icons/${modelId}.png`;
    try {
      const pngResponse = await fetch(pngUrl);
      if (pngResponse.ok) return pngUrl;
    } catch (error) {
      // Continue to next option
    }

    // Since we can't reliably check favicon content with no-cors,s
    // we'll just try the URLs in order and let the img tag handle fallback
    const faviconUrls =
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${providerBase}.ai/&size=256` ||
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${modelProvider}.com/&size=256` ||
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${modelProvider}.ai/&size=256` ||
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${modelProvider}.tech/&size=256` ||
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://huggingface.co/&size=256`;

    // Return the first URL - we'll handle errors in the img tag
    return faviconUrls;
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const updateModel = async () => {
    const modelRef = doc(collection(db, "models"), modelProvider);
    await setDoc(modelRef, {img: img});
  };

  return (
    <div className="p-3 border flex flex-row  gap-4">
      <div className="rounded-full size-8 border">
        <img src={img} className="w-8 h-8" />
      </div>
      <h1>{modelProvider}</h1>

      <span className="text-muted-foreground">{models.length} models</span>

      <Input
        type="text"
        value={img}
        onChange={(e) => setImg(e.target.value)}
        className="w-40"
      />

      {isInDb ? (
        <Button variant={"outline"} onClick={updateModel} className="ml-auto">
          update
        </Button>
      ) : (
        <Button className="ml-auto" onClick={saveModel}>
          Save to db
        </Button>
      )}
      {isExpanded && (
        <div className="flex flex-col gap-2">
          {models.map((model) => (
            <span key={model.id}>{model.id}</span>
          ))}
        </div>
      )}
      {isExpanded ? (
        <Button className="" onClick={() => setIsExpanded(false)}>
          hide
        </Button>
      ) : (
        <Button className="" onClick={() => setIsExpanded(true)}>
          show models
        </Button>
      )}
    </div>
  );
};
