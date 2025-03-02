"use client";

import React from "react";
import {CreditsCard} from "./components/credits-card";
import {Models} from "./components/models";
const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6  w-full h-screen   flex flex-col">
      <CreditsCard />
      <Models />
    </div>
  );
};

export default DashboardPage;
