"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AuthLayout({ children }) {
    return (
        <main className="min-h-screen flex w-full bg-bg-base text-text-primary overflow-hidden">
            {/* LEFT SIDE: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 w-full lg:w-1/2">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md flex flex-col items-center"
                >
                    <Link href="/" className="lg:hidden mb-8 flex items-center gap-2">
                        <Image src="/logo.svg" alt="CodeBounty" width={32} height={32} className="dark:invert" />
                        <span className="font-bold text-xl tracking-wide text-text-primary">CodeBounty</span>
                    </Link>
                    {children}
                </motion.div>
            </div>

            {/* RIGHT SIDE: Branded Panel (Hidden on mobile) */}
            <div className="hidden lg:flex lg:flex-1 relative bg-bg-surface border-l border-border flex-col justify-center items-center p-12 overflow-hidden">
                {/* Subtle Purple Radial Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] pointer-events-none"
                />

                <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-150"></div>
                        <Image src="/logo.svg" alt="CodeBounty" width={80} height={80} className="dark:invert relative z-10 drop-shadow-2xl" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-text-primary tracking-tight">
                        Master the patterns.
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed">
                        Join thousands of engineers solving real-world challenges, practicing algorithms, and hosting live coding sessions.
                    </p>
                </div>
            </div>
        </main>
    );
}