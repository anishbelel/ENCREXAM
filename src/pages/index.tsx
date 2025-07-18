import { useState, useEffect } from "react";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import useHasMounted from "@/hooks/useHasMounted";
import CountdownCard from "@/components/Countdown/Countdown";
//import { isMetaProperty } from "typescript";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

export default function Home() {
	const [contests, setContests] = useState<any[]>([]);
	const [loadingProblems, setLoadingProblems] = useState(true);
	const hasMounted = useHasMounted();

	useEffect(() => {
		const fetchContests = async () => {
			const colRef = collection(firestore, "contests");
			const snap = await getDocs(colRef);
			const data = snap.docs.map(doc => doc.data());
			setContests(data);
		};
		fetchContests();
	}, []);

	if (!hasMounted) return null;

	return (
		<>
			<main className='bg-[#030000] min-h-screen'>
				<Topbar />

				<div className='flex flex-col lg:flex-row gap-8 px-6 py-10 max-w-7xl mx-auto'>

					{/* LEFT: Contests Section */}
					<div className='lg:w-1/2 w-full'>
						<h1 className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mb-5'>
							Recent and Upcoming Contests
						</h1>

						{contests.length === 0 ? (
							<LoadingSkeleton />
						) : (
							<div className='flex items-center flex-col gap-8'>
								{contests.map((contest, idx) => (
									<CountdownCard
										key={idx}
										name={contest.name}
										date={contest.date}
										duration={contest.duration}
										questions={contest.questions}
									/>
								))}
							</div>
						)}
					</div>

					{/* RIGHT: Problems Table */}
					<div className='lg:w-1/2 w-full'>
						<h1 className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mb-5'>
							↪️ SOLVE PREVIOUS CONTEST PROBLEMS ↩️
						</h1>

						<div className='relative overflow-x-auto pb-10'>
							{loadingProblems && (
								<div className='w-full animate-pulse'>
									{[...Array(10)].map((_, idx) => (
										<LoadingSkeleton1 key={idx} />
									))}
								</div>
							)}

							<table className='text-sm text-left text-gray-500 dark:text-gray-400 w-full'>
								{!loadingProblems && (
									<thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b'>
										<tr>
											<th scope='col' className='px-1 py-3 w-0 font-medium'>Status</th>
											<th scope='col' className='px-6 py-3 w-0 font-medium'>Title</th>
											<th scope='col' className='px-6 py-3 w-0 font-medium'>Difficulty</th>
											<th scope='col' className='px-6 py-3 w-0 font-medium'>Category</th>
											<th scope='col' className='px-6 py-3 w-0 font-medium'>Solution</th>
										</tr>
									</thead>
								)}
								<ProblemsTable setLoadingProblems={setLoadingProblems} />
							</table>
						</div>
					</div>
				</div>
			</main>
		</>

	);
}

const LoadingSkeleton = () => {
	return (
		<div className="flex flex-col gap-8 items-center mt-8">
			{[1, 3].map((_, idx) => (
				<div
					key={idx}
					className="w-full max-w-md rounded-xl border border-gray-700 bg-dark-layer-1 p-6 shadow animate-pulse"
				>
					<div className="h-6 bg-dark-fill-3 rounded w-2/3 mb-4"></div>
					<div className="h-5 bg-dark-fill-2 rounded w-full mb-4"></div>
					<div className="h-10 bg-dark-fill-3 rounded w-1/2 mx-auto"></div>
				</div>
			))}
		</div>
	);
};

const LoadingSkeleton1 = () => {
	return (
		<div className='flex items-center space-x-12 mt-4 px-6'>
			<div className='w-6 h-6 shrink-0 rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
			<span className='sr-only'>Loading...</span>
		</div>
	);
};