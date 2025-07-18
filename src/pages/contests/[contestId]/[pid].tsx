import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";
import { auth, firestore } from "@/firebase/firebase";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";




type ProblemPageProps = {
	problem: Problem;
	contestId: string;
	questions: string[];
};

const parseDuration = (duration: string) => {
	const match = duration.match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
	if (!match) return 0;
	const hours = parseInt(match[1] || "0", 10);
	const minutes = parseInt(match[2] || "0", 10);
	return (hours * 60 + minutes) * 60 * 1000;
};

const ContestProblemPage: React.FC<ProblemPageProps> = ({ problem, contestId, questions }) => {
	const hasMounted = useHasMounted();
	const [started, setStarted] = useState(false);
	const router = useRouter();
	const [noOfTimesEscape, setnoOfTimesEscape] = useState(0);
	const [user] = useAuthState(auth);
	const [isBlockedhere, setIsBlockedhere] = useState<number>(0);

	// ✅ Fetch user block status
	useEffect(() => {
	const fetchUser = async () => {
		if (user) {
			const userRef = doc(firestore, "users", user.uid);
			const snap = await getDoc(userRef);
			if (snap.exists()) {
				const data = snap.data();
				const currentBlockedValue = typeof data?.isBlocked === "number" ? data.isBlocked : 56;

				// Step 1: Update local state from Firestore
				setIsBlockedhere(currentBlockedValue);

				// Step 2: Update Firestore with incremented value
				await updateDoc(userRef, {
					isBlocked: currentBlockedValue + 1,
				});
			}
		}
	};

	fetchUser();
}, [user]);

	// This is when the time is up you will be removed
	useEffect(() => {
		const fetchContestDetailsAndRedirect = async () => {
			if (!contestId) return;

			const contestRef = doc(firestore, "contests", contestId);
			const contestSnap = await getDoc(contestRef);

			if (contestSnap.exists()) {
				const data = contestSnap.data();
				const startTime = new Date(data.date); // Firestore Timestamp or ISO string
				const durationMs = parseDuration(data.duration);
				const endTime = new Date(startTime.getTime() + durationMs);

				const timeLeft = endTime.getTime() - new Date().getTime();

				if (timeLeft <= 0) {
					router.push("/"); // Contest already over
				} else {
					setTimeout(() => {
						router.push("/");
					}, timeLeft);
				}
			}
		};

		fetchContestDetailsAndRedirect();
	}, [contestId, router]);

	// This is the when you press the escape button you will be redirected to the home page button
	useEffect(() => {
		const handleFullscreenChange = () => {
			if (noOfTimesEscape > 1) {
				router.push("/");
			} // Or end contest / submit / warn, etc.
			else if (!document.fullscreenElement) {
				setnoOfTimesEscape(noOfTimesEscape + 1);
				toast.warning("Several times pressing Esc may cause restrict you from participating", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});

				setStarted(false);
			}

		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, [router, noOfTimesEscape]);


	//This is when you try to access the taskbar during the contest by pressing 🪟 sign then you will be thrown to the home page
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				// block user
				router.push("/");
			}
		};

		// const handleWindowBlur = () => {
		// 	// could use a counter here (e.g., ESC presses + blur)
		// 	console.log("Window blurred");
		// };

		// window.addEventListener("blur", handleWindowBlur);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			// window.removeEventListener("blur", handleWindowBlur);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	// If you do tab switch then no mercy immediately you will get blocked and switched to the home screen
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				if (user) {
					router.push("/");
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);


	

	// So many if else statement to make sure that it executed in all the modern and old browsers
	const handleEnterFullscreen = async () => {
		const elem = document.documentElement;
		if (elem.requestFullscreen) {
			await elem.requestFullscreen();
		} else if ((elem as any).webkitRequestFullscreen) {
			await (elem as any).webkitRequestFullscreen();
		} else if ((elem as any).mozRequestFullScreen) {
			await (elem as any).mozRequestFullScreen();
		} else if ((elem as any).msRequestFullscreen) {
			await (elem as any).msRequestFullscreen();
		}
		setStarted(true); // allow rendering after entering fullscreen
	};


	

	if (!hasMounted) return null;

	if (isBlockedhere > 56) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-dark-layer-1 text-white">
				<h1 className="text-2xl font-semibold">You are blocked from participating in this contest as you repeatadely keep on pressing ESC or switch the tab</h1>
			</div>
		);
	}

	if (!started) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-dark-layer-1 text-white">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-semibold">Start Contest Mode</h1>
					<p>This will enter full screen for distraction-free experience.</p>
					<button
						className="px-4 py-2 bg-brand-orange rounded text-white hover:bg-orange-600"
						onClick={handleEnterFullscreen}
					>
						Enter Fullscreen & Start
					</button>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Topbar problemPage questions={questions} contestId={contestId} />
			<Workspace problem={problem} />
		</div>
	);
};

export default ContestProblemPage;


export async function getStaticPaths() {
	const snapshot = await getDocs(collection(firestore, "contests"));
	const paths: { params: { contestId: string; pid: string } }[] = [];

	snapshot.forEach(doc => {
		const contestData = doc.data();
		const contestId = doc.id;

		if (Array.isArray(contestData.questions)) {
			for (const pid of contestData.questions) {
				paths.push({
					params: {
						contestId,
						pid,
					},
				});
			}
		}
	});

	return {
		paths,
		fallback: false,
	};
}


export async function getStaticProps({ params }: { params: { contestId: string; pid: string } }) {
	const { contestId, pid } = params;

	// fallback to local mock data
	const problem = problems[pid];
	if (!problem) return { notFound: true };

	problem.handlerFunction = problem.handlerFunction.toString();

	// fetch the full contest to get question list
	const snap = await getDocs(collection(firestore, "contests"));
	let questions: string[] = [];

	snap.forEach(doc => {
		if (doc.id === contestId) {
			questions = doc.data().questions || [];
		}
	});

	return {
		props: {
			problem,
			contestId,
			questions,
		},
	};
}
