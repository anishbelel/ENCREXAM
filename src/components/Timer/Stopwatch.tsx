// components/Stopwatch.tsx
import { useEffect, useState } from "react";

type Props = {
	startTime: string; // ISO string
	duration: string; // e.g., "1h 30m"
};

const parseDuration = (duration: string) => {
	const regex = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i;
	const match = duration.match(regex);
	if (!match) return 0;
	const hours = parseInt(match[1] || "0", 10);
	const minutes = parseInt(match[2] || "0", 10);
	return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
};

const getTimeRemaining = (end: Date) => {
	const total = end.getTime() - new Date().getTime();
	const seconds = Math.floor((total / 1000) % 60);
	const minutes = Math.floor((total / 1000 / 60) % 60);
	const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
	const days = Math.floor(total / (1000 * 60 * 60 * 24));
	return {
		total,
		days: Math.max(0, days),
		hours: Math.max(0, hours),
		minutes: Math.max(0, minutes),
		seconds: Math.max(0, seconds),
	};
};

const Stopwatch = ({ startTime, duration }: Props) => {
	const start = new Date(startTime);
	const end = new Date(start.getTime() + parseDuration(duration));
	const [remaining, setRemaining] = useState(() => getTimeRemaining(end));

	useEffect(() => {
		const interval = setInterval(() => {
			setRemaining(getTimeRemaining(end));
		}, 1000);
		return () => clearInterval(interval);
	}, [end]);

	return (
		<div className="flexd top-4 right-4 bg-dark-fill-3 text-white px-4 py-2 rounded-md shadow-lg text-sm font-semibold">
			Time Left:{" "}
			{`${String(remaining.hours).padStart(2, "0")}h :
			${String(remaining.minutes).padStart(2, "0")}m :
			${String(remaining.seconds).padStart(2, "0")}s`}
		</div>
	);
};

export default Stopwatch;
