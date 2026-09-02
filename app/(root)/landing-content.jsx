"use client";

import {
  Code2,
  Trophy,
  Users,
  Zap,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";

export default function LandingContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleStartCoding = () => {
    toast.success("Welcome to CodeBounty! Preparing your workspace...", {
      description: "Redirecting you to the problem catalog.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen overflow-hidden text-text-primary">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center">
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center z-10 w-full"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center rounded-full border border-border bg-bg-surface/50 px-3 py-1 text-sm text-text-secondary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
              Join 10,000+ developers practicing daily
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          >
            Master algorithms. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-gradient-end">
              Ship better code.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-text-muted max-w-2xl mb-12"
          >
            A pattern-first DSA practice platform. Learn concepts, practice in a high-performance editor, and host collaborative coding sessions.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
            <Link href="/problems" onClick={handleStartCoding}>
              <Button 
                size="lg" 
                className="relative group bg-accent hover:bg-accent-hover text-white px-8 py-6 text-lg rounded-xl transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]"></div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
                Start Practicing
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Code Editor Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 3 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ perspective: "1000px" }}
          className="mt-24 w-full max-w-5xl z-10"
        >
          <div className="rounded-2xl border border-border bg-bg-surface/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] shadow-accent/10 backdrop-blur-md overflow-hidden transform-gpu hover:rotate-x-0 transition-transform duration-500">
            <div className="flex items-center px-4 py-3 border-b border-border bg-bg-elevated/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
              </div>
              <div className="mx-auto text-xs font-mono text-text-muted">two-sum.ts</div>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden text-left bg-[#0A0A0B]/80">
              <pre className="text-text-secondary">
                <span className="text-accent">function</span> <span className="text-[#3b82f6]">twoSum</span>(nums: <span className="text-[#22c55e]">number</span>[], target: <span className="text-[#22c55e]">number</span>): <span className="text-[#22c55e]">number</span>[] {'{\n'}
                {'  '}const map = new <span className="text-accent">Map</span>{'<number, number>()'};\n
                {'  '}for (let i = 0; i &lt; nums.length; i++) {'{\n'}
                {'    '}const complement = target - nums[i];\n
                {'    '}if (map.<span className="text-[#3b82f6]">has</span>(complement)) {'{\n'}
                {'      '}return [map.<span className="text-[#3b82f6]">get</span>(complement)!, i];\n
                {'    '}{'}\n'}
                {'    '}map.<span className="text-[#3b82f6]">set</span>(nums[i], i);\n
                {'  '}{'}\n'}
                {'  '}return [];\n
                {'}\n'}
              </pre>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="w-full max-w-7xl px-6 py-24 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for performance.</h2>
          <p className="text-text-muted text-lg">Everything you need to level up your engineering skills.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Feature 1 (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 row-span-1 rounded-2xl bg-bg-surface border border-border p-8 flex flex-col justify-end relative overflow-hidden group hover:border-border/80 transition-colors duration-300"
          >
            <div className="absolute top-8 right-8 text-accent/20 group-hover:text-accent/40 transition-colors duration-300">
              <Terminal className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-2">High-Performance Editor</h3>
              <p className="text-text-muted">Powered by Monaco, featuring multi-language support, vim bindings, and instant feedback via Judge0.</p>
            </div>
          </motion.div>

          {/* Feature 2 (Small) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-bg-elevated border border-border p-8 flex flex-col justify-between group hover:border-border/80 transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-text-primary group-hover:scale-105 group-hover:text-accent transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Host Sessions</h3>
              <p className="text-text-muted text-sm">Create collaborative practice rooms with zero friction.</p>
            </div>
          </motion.div>

          {/* Feature 3 (Small) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-bg-surface border border-border p-8 flex flex-col justify-between group hover:border-border/80 transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-primary group-hover:scale-105 group-hover:text-success transition-all duration-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-text-muted text-sm">Detailed insights on your algorithmic journey.</p>
            </div>
          </motion.div>

          {/* Feature 4 (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 row-span-1 rounded-2xl bg-bg-elevated border border-border p-8 flex flex-col justify-end relative overflow-hidden group hover:border-border/80 transition-colors duration-300"
          >
            <div className="absolute top-8 right-8 text-border group-hover:text-border/80 transition-colors duration-300">
              <Cpu className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-2">Pattern-First Approach</h3>
              <p className="text-text-muted">Stop blindly grinding. Learn the underlying structural patterns (Sliding Window, Two Pointers, DFS) that apply to hundreds of variations.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Global CSS for shimmer */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}} />
    </div>
  );
}
