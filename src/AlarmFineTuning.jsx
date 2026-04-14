import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ReferenceArea,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from "recharts";

// ─── Sample Data ───────────────────────────────────────────────
const trendData = [
    { date: "20 Apr", time: "08:00", value: 0.005, fullDate: "20 Apr 2024, 08:00 AM" },
    { date: "21 Apr", time: "10:00", value: 0.006, fullDate: "21 Apr 2024, 10:00 AM" },
    { date: "22 Apr", time: "09:30", value: 0.005, fullDate: "22 Apr 2024, 09:30 AM" },
    { date: "22 Apr", time: "14:00", value: 0.007, fullDate: "22 Apr 2024, 02:00 PM" },
    { date: "23 Apr", time: "11:00", value: 0.009, fullDate: "23 Apr 2024, 11:00 AM" },
    { date: "23 Apr", time: "16:00", value: 0.01, fullDate: "23 Apr 2024, 04:00 PM" },
    { date: "24 Apr", time: "07:00", value: 0.011, fullDate: "24 Apr 2024, 07:00 AM" },
    { date: "24 Apr", time: "11:23", value: 0.027, fullDate: "24 Apr 2024, 11:23 AM" },
    { date: "24 Apr", time: "14:00", value: 0.018, fullDate: "24 Apr 2024, 02:00 PM" },
    { date: "24 Apr", time: "17:00", value: 0.015, fullDate: "24 Apr 2024, 05:00 PM" },
    { date: "25 Apr", time: "09:00", value: 0.011, fullDate: "25 Apr 2024, 09:00 AM" },
];

// ─── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500 font-medium">{data.fullDate}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                    Value:{" "}
                    <span className="text-indigo-600">{data.value.toFixed(3)} mm/s</span>
                </p>
            </div>
        );
    }
    return null;
};

// ─── Threshold Badge ───────────────────────────────────────────
const ThresholdBadge = ({ label, color, bgColor }) => (
    <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${bgColor} ${color}`}
    >
        <span className={`w-2 h-2 rounded-full ${color.replace("text-", "bg-")}`} />
        {label}
    </span>
);

// ─── Toast Notification ────────────────────────────────────────
const Toast = ({ message, visible, onClose }) => (
    <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
    >
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            </svg>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 text-emerald-400 hover:text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────
export default function AlarmFineTuning() {
    const [activeMetric, setActiveMetric] = useState("OA Velocity");
    const [timeRange, setTimeRange] = useState("5d");
    const [autoMode, setAutoMode] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [thresholds, setThresholds] = useState({
        reference: 0.01,
        preAlarm: 0.03,
        alarm: 0.06,
        danger: 0.09,
    });
    const [errors, setErrors] = useState({});

    const metrics = ["OA Velocity", "Peak", "RMS", "Kurtosis"];
    const timeRanges = ["1d", "5d", "30d", "90d", "1y"];

    // Validate thresholds
    useEffect(() => {
        const newErrors = {};
        if (thresholds.reference >= thresholds.preAlarm)
            newErrors.reference = "Must be less than Pre-Alarm";
        if (thresholds.preAlarm >= thresholds.alarm)
            newErrors.preAlarm = "Must be less than Alarm";
        if (thresholds.alarm >= thresholds.danger)
            newErrors.alarm = "Must be less than Danger";
        if (thresholds.danger <= 0) newErrors.danger = "Must be greater than 0";
        setErrors(newErrors);
    }, [thresholds]);

    const handleSave = () => {
        if (Object.keys(errors).length === 0) {
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);
        }
    };

    const handleThresholdChange = (key, value) => {
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            setThresholds((prev) => ({ ...prev, [key]: num }));
        }
    };

    // Stats
    const values = trendData.map((d) => d.value);
    const avgValue = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(4);
    const maxValue = Math.max(...values).toFixed(4);
    const minValue = Math.min(...values).toFixed(4);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <button className="p-2 rounded-lg hover:bg-white/60 transition-colors">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Alarms Fine Tuning</h1>
                        </div>
                        <p className="text-sm text-gray-500 ml-12">
                            Configure thresholds and review recent trend behavior
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={Object.keys(errors).length > 0}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </button>
                        <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Left Column: Chart ─────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6">
                            {/* Metric & Time Selectors */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
                                    {metrics.map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setActiveMetric(m)}
                                            className={`text-xs font-medium px-4 py-2 rounded-lg transition-all ${activeMetric === m
                                                    ? "bg-white text-indigo-700 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
                                    {timeRanges.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTimeRange(t)}
                                            className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${timeRange === t
                                                    ? "bg-white text-indigo-700 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                <ThresholdBadge label="Reference" color="text-emerald-700" bgColor="bg-emerald-50" />
                                <ThresholdBadge label="Pre-Alarm" color="text-amber-700" bgColor="bg-amber-50" />
                                <ThresholdBadge label="Alarm" color="text-orange-700" bgColor="bg-orange-50" />
                                <ThresholdBadge label="Danger" color="text-red-700" bgColor="bg-red-50" />
                            </div>

                            {/* Chart */}
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="fullDate"
                                            tickFormatter={(val) => val.split(",")[0]}
                                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                                            axisLine={{ stroke: "#e2e8f0" }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={[0, 0.1]}
                                            label={{
                                                value: "mm/s",
                                                angle: -90,
                                                position: "insideLeft",
                                                offset: 20,
                                                style: { fontSize: 11, fill: "#94a3b8" },
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />

                                        {/* Threshold zones */}
                                        <ReferenceArea y1={0} y2={thresholds.reference} fill="#ecfdf5" fillOpacity={0.5} />
                                        <ReferenceArea
                                            y1={thresholds.reference}
                                            y2={thresholds.preAlarm}
                                            fill="#fffbeb"
                                            fillOpacity={0.5}
                                        />
                                        <ReferenceArea
                                            y1={thresholds.preAlarm}
                                            y2={thresholds.alarm}
                                            fill="#fff7ed"
                                            fillOpacity={0.5}
                                        />
                                        <ReferenceArea
                                            y1={thresholds.alarm}
                                            y2={thresholds.danger}
                                            fill="#fef2f2"
                                            fillOpacity={0.5}
                                        />

                                        {/* Threshold lines */}
                                        <ReferenceLine
                                            y={thresholds.reference}
                                            stroke="#10b981"
                                            strokeDasharray="4 4"
                                            strokeWidth={1.5}
                                        />
                                        <ReferenceLine
                                            y={thresholds.preAlarm}
                                            stroke="#f59e0b"
                                            strokeDasharray="4 4"
                                            strokeWidth={1.5}
                                        />
                                        <ReferenceLine
                                            y={thresholds.alarm}
                                            stroke="#f97316"
                                            strokeDasharray="4 4"
                                            strokeWidth={1.5}
                                        />
                                        <ReferenceLine
                                            y={thresholds.danger}
                                            stroke="#ef4444"
                                            strokeDasharray="4 4"
                                            strokeWidth={1.5}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="none"
                                            fill="url(#lineGrad)"
                                            fillOpacity={1}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#6366f1"
                                            strokeWidth={2.5}
                                            dot={{ fill: "#6366f1", strokeWidth: 2, r: 4, stroke: "#fff" }}
                                            activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#fff" }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Average", value: avgValue, icon: "📊", color: "text-indigo-600" },
                                { label: "Maximum", value: maxValue, icon: "📈", color: "text-orange-600" },
                                { label: "Minimum", value: minValue, icon: "📉", color: "text-emerald-600" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{stat.icon}</span>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            {stat.label}
                                        </span>
                                    </div>
                                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">mm/s</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right Column: Settings ─────────────────── */}
                    <div className="space-y-6">
                        {/* Equipment Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">P 1000 PUL</h3>
                                    <p className="text-sm text-gray-500">Motor</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">Point: MDB – RH</span>
                            </div>
                        </div>

                        {/* Threshold Settings Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
                                Threshold Settings
                            </h3>

                            {[
                                { key: "reference", label: "Reference", color: "bg-emerald-500", ring: "focus:ring-emerald-200" },
                                { key: "preAlarm", label: "Pre-Alarm", color: "bg-amber-500", ring: "focus:ring-amber-200" },
                                { key: "alarm", label: "Alarm", color: "bg-orange-500", ring: "focus:ring-orange-200" },
                                { key: "danger", label: "Danger", color: "bg-red-500", ring: "focus:ring-red-200" },
                            ].map(({ key, label, color, ring }) => (
                                <div key={key} className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                            <label className="text-sm font-medium text-gray-700">{label}</label>
                                        </div>
                                        <span className="text-xs text-gray-400">mm/s</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={thresholds[key]}
                                        onChange={(e) => handleThresholdChange(key, e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-800 transition-all focus:outline-none focus:ring-2 ${ring} ${errors[key] ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:bg-white"
                                            }`}
                                    />
                                    {errors[key] && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors[key]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {/* Auto Mode */}
                            <div className="mt-6 pt-5 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">Auto Mode</h4>
                                        <p className="text-xs text-gray-400 mt-0.5">Auto-calculate from baseline</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoMode(!autoMode)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${autoMode ? "bg-indigo-600" : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoMode ? "translate-x-5" : "translate-x-0"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {autoMode && (
                                    <div className="space-y-3 animate-in fade-in">
                                        {[
                                            { label: "Reference", mult: "2.00", result: "4.00" },
                                            { label: "Pre-Alarm", mult: "4.00", result: "6.00" },
                                        ].map(({ label, mult, result }) => (
                                            <div key={label} className="flex items-center gap-2 bg-indigo-50/50 rounded-xl px-4 py-3">
                                                <span className="text-xs font-medium text-gray-600 w-20">{label}</span>
                                                <input
                                                    type="number"
                                                    defaultValue={mult}
                                                    className="w-16 text-sm font-medium text-center bg-white rounded-lg border border-indigo-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                />
                                                <span className="text-gray-400">×</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                                <span className="text-sm font-bold text-indigo-600">{result}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Upward Trend Detected</p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        Values increased 170% in last 5 days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            <Toast
                message="Thresholds updated successfully!"
                visible={toastVisible}
                onClose={() => setToastVisible(false)}
            />
        </div>
    );
}