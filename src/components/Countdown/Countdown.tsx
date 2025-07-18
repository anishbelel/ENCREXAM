import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

type CountdownCardProps = {
  name: string;
  date: string; // ISO string of start date
  duration: string; // e.g., "1h 30m"
  questions: string[];
};

const getTimeRemaining = (targetDate: Date) => {
  const total = targetDate.getTime() - new Date().getTime();
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

const parseDuration = (duration: string) => {
  const regex = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i;
  const match = duration.match(regex);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
};

const CountdownCard = ({ name, date, duration, questions }: CountdownCardProps) => {
  const router = useRouter();
  const startTime = new Date(date);
  const durationMs = parseDuration(duration);
  const endTime = new Date(startTime.getTime() + durationMs);
  const now = new Date();

  const [timeUntilStart, setTimeUntilStart] = useState(() => getTimeRemaining(startTime));
  const [timeUntilEnd, setTimeUntilEnd] = useState(() => getTimeRemaining(endTime));

  const [isStarted, setIsStarted] = useState(now >= startTime);
  const [isEnded, setIsEnded] = useState(now >= endTime);

  const [user] = useAuthState(auth);
  const [isBlocked, setIsBlocked] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setIsStarted(now >= startTime);
      setIsEnded(now >= endTime);
      setTimeUntilStart(getTimeRemaining(startTime));
      setTimeUntilEnd(getTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  useEffect(() => {
		const fetchUser = async () => {
			if (user) {
				const userRef = doc(firestore, "users", user.uid);
				const snap = await getDoc(userRef);
				if (snap.exists()) {
					const data = snap.data();
					if (data?.isBlocked) {
						setIsBlocked(data.isBlocked);
					}
				}
			}
		};

		fetchUser();
	}, [user]);

  const handleClick = () => {
    if (!isEnded && isStarted) {
      if(isBlocked>56){
        toast.error("You are blocked from participating in this contest as you repeatadely keep on pressing ESC or switch the tab", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
      }
      else router.push(`/contests/${name}/${questions[0]}`);
    }
  };

  const getTimeDisplay = () => {
    const t = isStarted ? timeUntilEnd : timeUntilStart;
    return `${String(t.days).padStart(2, "0")}d : ${String(t.hours).padStart(2, "0")}h : ${String(
      t.minutes
    ).padStart(2, "0")}m : ${String(t.seconds).padStart(2, "0")}s`;
  };

  const getButtonLabel = () => {
    if (!isStarted) return "Contest Not Started";
    if (isStarted && !isEnded) return "Start Exam";
    return "Contest Ended";
  };

  return (
    <div className="bg-dark-layer-1 text-white border rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">{name.toUpperCase()}</h2>
      <div className="text-lg">{getTimeDisplay()}</div>
      <button
        onClick={handleClick}
        disabled={!isStarted || isEnded}
        className={`px-4 py-2 rounded-md font-semibold ${isStarted && !isEnded
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-500 cursor-not-allowed"
          }`}
      >
        {getButtonLabel()}
      </button>
    </div>
  );
};

export default CountdownCard;
