"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import {
    Flame, Target, Trophy, Activity, CheckCircle2, XCircle, Clock,
    ChevronDown, ChevronUp, Code2
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// -------------------------------------------------------------
// Animated Counter Component
// -------------------------------------------------------------
const AnimatedCounter = ({ value, duration = 0.8 }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, value, { duration, ease: "easeOut" });
        return controls.stop;
    }, [value]);

    return <motion.span>{rounded}</motion.span>;
};

// -------------------------------------------------------------
// Heatmap Component
// -------------------------------------------------------------
const ActivityHeatmap = ({ submissions }) => {
    // Generate last 120 days of activity
    const days = 120;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityMap = useMemo(() => {
        const map = new Map();
        submissions.forEach(sub => {
            const d = new Date(sub.createdAt);
            d.setHours(0, 0, 0, 0);
            const key = d.getTime();
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }, [submissions]);

    const squares = useMemo(() => {
        const sq = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const key = date.getTime();
            const count = activityMap.get(key) || 0;
            sq.push({ date, count });
        }
        return sq;
    }, [activityMap, today]);

    const maxCount = Math.max(...squares.map(s => s.count), 1);

    const getOpacity = (count) => {
        if (count === 0) return 0.05; // very faint base
        return 0.2 + (count / maxCount) * 0.8; // scales from 0.2 to 1.0
    };

    return (
        <TooltipProvider delayDuration={100}>
            <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex flex-col gap-1 min-w-max">
                    <div className="flex gap-1">
                        {squares.map((sq, i) => (
                            <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.005, duration: 0.2 }}
                                        className="w-3 h-3 rounded-[2px] transition-transform hover:scale-125"
                                        style={{
                                            backgroundColor: sq.count === 0 ? 'var(--bg-elevated)' : 'var(--accent)',
                                            opacity: sq.count === 0 ? 1 : getOpacity(sq.count)
                                        }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="bg-bg-elevated border-border text-text-primary text-xs">
                                    <p className="font-semibold">{sq.count} submissions</p>
                                    <p className="text-text-muted">{sq.date.toLocaleDateString()}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

// -------------------------------------------------------------
// Circular Progress Component
// -------------------------------------------------------------
const CircularProgress = ({ percentage }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = useMotionValue(circumference);

    useEffect(() => {
        const targetOffset = circumference - (percentage / 100) * circumference;
        animate(strokeDashoffset, targetOffset, { duration: 1, ease: "easeOut", delay: 0.2 });
    }, [percentage, circumference]);

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-bg-elevated"
                />
                <motion.circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset }}
                    className="text-accent stroke-current drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-text-primary">
                <AnimatedCounter value={percentage} />%
            </span>
        </div>
    );
};

export default function DashboardClient({ profileData }) {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [expandedRow, setExpandedRow] = useState(null);

    const submissions = profileData.submissions || [];

    // Stats calculation
    const totalSubmissions = submissions.length;
    const acceptedCount = submissions.filter(s => s.status === 'Accepted').length;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

    // Current streak logic (simplified for UI demonstration)
    const currentStreak = submissions.length > 0 ? 5 : 0; // Mocked logic: in reality, calculate consecutive days

    // Donut chart data (Mocked diff distribution from solvedProblems if available, or just static for demo)
    const diffData = [
        { name: 'Easy', value: 45, color: '#22C55E' },
        { name: 'Medium', value: 30, color: '#F59E0B' },
        { name: 'Hard', value: 10, color: '#EF4444' },
    ];

    const filteredSubmissions = useMemo(() => {
        if (statusFilter === "ALL") return submissions;
        return submissions.filter(s => {
            if (statusFilter === "ACCEPTED") return s.status === "Accepted";
            if (statusFilter === "FAILED") return s.status !== "Accepted";
            return true;
        });
    }, [submissions, statusFilter]);

    const getStatusStyle = (status) => {
        if (status === 'Accepted') return "bg-success/10 text-success";
        if (status.includes('Time')) return "bg-pending/10 text-pending";
        return "bg-error/10 text-error";
    };

    const getStatusIcon = (status) => {
        if (status === 'Accepted') return <CheckCircle2 className="w-4 h-4 text-success" />;
        if (status.includes('Time')) return <Clock className="w-4 h-4 text-pending" />;
        return <XCircle className="w-4 h-4 text-error" />;
    };

    return (
        <div className="w-full min-h-screen bg-bg-base pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-text-primary overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* =========================================
                    ZONE A: STATS OVERVIEW (WOW ZONE)
                ========================================= */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
                        <p className="text-text-muted">Track your progress, activity, and submission history.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Bento Card 1: Total Submissions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="col-span-1 md:col-span-3 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3 text-text-muted mb-4">
                                <Activity className="w-5 h-5" />
                                <span className="font-medium text-sm">Total Submissions</span>
                            </div>
                            <div className="text-4xl font-black text-text-primary">
                                <AnimatedCounter value={totalSubmissions} />
                            </div>
                        </motion.div>

                        {/* Bento Card 2: Acceptance Rate */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
                            className="col-span-1 md:col-span-3 bg-bg-elevated border border-border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 text-text-muted mb-4 relative z-10">
                                <Target className="w-5 h-5" />
                                <span className="font-medium text-sm">Acceptance Rate</span>
                            </div>
                            <div className="flex items-end justify-between relative z-10">
                                <div className="text-4xl font-black text-text-primary">
                                    <AnimatedCounter value={acceptanceRate} /><span className="text-2xl text-text-muted">%</span>
                                </div>
                                <CircularProgress percentage={acceptanceRate} />
                            </div>
                        </motion.div>

                        {/* Bento Card 3: Current Streak */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
                            className="col-span-1 md:col-span-3 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
                        >
                            {currentStreak > 0 && (
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full group-hover:bg-orange-500/30 transition-colors" />
                            )}
                            <div className="flex items-center gap-3 text-text-muted mb-4 relative z-10">
                                <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500' : ''}`} />
                                <span className="font-medium text-sm">Current Streak</span>
                            </div>
                            <div className="text-4xl font-black text-text-primary relative z-10">
                                <AnimatedCounter value={currentStreak} /><span className="text-xl text-text-muted ml-2 font-medium">Days</span>
                            </div>
                        </motion.div>

                        {/* Bento Card 4: Language/Topic Donut (Recharts) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}
                            className="col-span-1 md:col-span-3 bg-bg-elevated border border-border rounded-2xl p-6 flex flex-col"
                        >
                            <div className="flex items-center gap-3 text-text-muted mb-2">
                                <Trophy className="w-5 h-5" />
                                <span className="font-medium text-sm">Solved Split</span>
                            </div>
                            <div className="flex-1 min-h-[80px] -ml-4 -mr-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={diffData}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {diffData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1C1C21', border: '1px solid #2A2A30', borderRadius: '8px' }}
                                            itemStyle={{ color: '#F5F5F7' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Bento Card 5: Activity Heatmap */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.32 }}
                            className="col-span-1 md:col-span-12 bg-bg-surface border border-border rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-lg font-bold text-text-primary">Activity Graph</h3>
                                <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                                    <span>Less</span>
                                    <div className="w-3 h-3 rounded-[2px] bg-bg-elevated" />
                                    <div className="w-3 h-3 rounded-[2px] bg-accent opacity-40" />
                                    <div className="w-3 h-3 rounded-[2px] bg-accent opacity-70" />
                                    <div className="w-3 h-3 rounded-[2px] bg-accent" />
                                    <span>More</span>
                                </div>
                            </div>
                            <ActivityHeatmap submissions={submissions} />
                        </motion.div>
                    </div>
                </div>

                {/* =========================================
                    ZONE B: SUBMISSION HISTORY TABLE
                ========================================= */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Recent Submissions</h2>
                            <p className="text-sm text-text-muted">Detailed log of your problem-solving attempts.</p>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-bg-surface border-border text-text-primary rounded-xl h-10">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-bg-elevated border-border text-text-primary rounded-xl">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="FAILED">Failed / Errors</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_100px_150px_40px] gap-4 px-4 py-3 border-b border-border text-xs font-semibold tracking-wider text-text-muted uppercase">
                            <div>Problem (ID)</div>
                            <div>Status</div>
                            <div>Language</div>
                            <div>Runtime</div>
                            <div>Memory</div>
                            <div>Date</div>
                            <div></div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col">
                            <AnimatePresence mode="popLayout">
                                {filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((sub, index) => {
                                        const isExpanded = expandedRow === sub.id;
                                        // Mock problem name parsing or use problem ID for now
                                        const problemName = `Problem #${sub.problemId.slice(0, 6)}`;

                                        return (
                                            <motion.div
                                                key={sub.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: (index % 15) * 0.03 }}
                                                className="border-b border-border"
                                            >
                                                {/* ROW (TIGHT DENSITY) */}
                                                <div
                                                    className={`grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_100px_150px_40px] gap-2 md:gap-4 px-4 py-2.5 md:py-2 items-center transition-colors cursor-pointer ${isExpanded ? 'bg-bg-elevated/50' : 'hover:bg-bg-elevated'}`}
                                                    onClick={() => setExpandedRow(isExpanded ? null : sub.id)}
                                                >
                                                    <div className="font-medium text-sm text-text-primary group-hover:text-accent truncate">
                                                        {problemName}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(sub.status)}
                                                        <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase border-0 ${getStatusStyle(sub.status)}`}>
                                                            {sub.status.length > 15 ? sub.status.slice(0, 12) + "..." : sub.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-xs font-mono text-text-secondary">{sub.language || "N/A"}</div>

                                                    <div className="text-xs font-mono text-text-muted">
                                                        {sub.performance?.time?.[0] || sub.time || "-"}
                                                    </div>

                                                    <div className="text-xs font-mono text-text-muted">
                                                        {sub.performance?.memory?.[0] || sub.memory || "-"}
                                                    </div>

                                                    <div className="text-xs text-text-muted">
                                                        {new Date(sub.createdAt).toLocaleDateString()}
                                                    </div>

                                                    <div className="flex justify-end">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                                                    </div>
                                                </div>

                                                {/* EXPANDED CODE BLOCK */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-bg-surface border-t border-border"
                                                        >
                                                            <div className="p-4">
                                                                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-text-muted">
                                                                    <Code2 className="w-4 h-4" />
                                                                    Submitted Code
                                                                </div>
                                                                <pre className="text-xs font-mono text-text-secondary bg-bg-base p-4 rounded-xl overflow-x-auto border border-border">
                                                                    <code>{sub.code || "// No code snippet stored for this submission"}</code>
                                                                </pre>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="py-16 flex flex-col items-center justify-center text-center"
                                    >
                                        <Code2 className="w-12 h-12 text-border mb-4" />
                                        <h3 className="text-lg font-medium text-text-primary mb-1">No submissions yet</h3>
                                        <p className="text-sm text-text-muted mb-6">Start solving problems to build your history.</p>
                                        <Link href="/problems">
                                            <button className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-6 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                                                Solve your first problem
                                            </button>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
