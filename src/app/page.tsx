"use client"

import { Hero } from "@/components/ui/animated-hero"
import { ProblemSolution } from "@/components/ui/problem-solution"

export default function Home() {
    return (
        <main className="min-h-screen overflow-hidden">
            <Hero />
            <ProblemSolution />
        </main>
    );
}