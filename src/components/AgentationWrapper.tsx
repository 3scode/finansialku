"use client";

import { Agentation } from "agentation";

export default function AgentationWrapper() {
  return process.env.NODE_ENV === "development" ? <Agentation /> : null;
}
