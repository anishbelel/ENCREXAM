import { auth } from "@/firebase/firebase";
import Link from "next/link";
import React, { useState,useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Buttons/Logout";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import Stopwatch from "../Timer/Stopwatch";
import { useRouter } from "next/router";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

type TopbarProps = {
	problemPage?: boolean;
	questions?: string[];
	contestId?: string;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage, questions, contestId }) => {
	const [user] = useAuthState(auth);
	const setAuthModalState = useSetRecoilState(authModalState);
	const router = useRouter();
	const [currProblemId, setcurrProblemId] = useState(0);
	let size = questions?.length ?? 0;
	const fixed_size = 5;

	const [start,setStart] = useState("");
	const [duration,setduration] = useState("");
	useEffect(() => {
		console.log(problems);
		if (!contestId) return; 
		const fetchContest = async () => {
			const contestRef = doc(firestore, "contests", contestId);
			const contestSnap = await getDoc(contestRef);

			if (contestSnap.exists()) {
				const data = contestSnap.data();
				setStart(data.date);
				setduration(data.duration);
			}
		};

		fetchContest();
	}, [contestId]);


	const handleProblemChange = (isForward: boolean) => {
		
		const direction = isForward ? 1 : -1;
		let s = (contestId) ? size : fixed_size;
		const nextProblemId = (currProblemId + direction+ s)%s;
		//const nextProblemKey = Object.keys(problems).find((key) => problems[key].order === nextProblemOrder);

		setcurrProblemId(nextProblemId);
		const keys = Object.keys(problems); // ['two-sum', 'jump-game', ...]

		if(contestId && questions) router.push(`/contests/${contestId}/${questions[nextProblemId]}`);
		else router.push(`/problems/${keys[nextProblemId]}`);
		
		
	};

	return (
		<nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
			<div className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1200px] mx-auto" : ""}`}>
				<Link href='/' className='h-[22px] flex-1'>
					<Image src='/logo-fulll.png' alt='Logo' height={300} width={100} />
				</Link>

				{problemPage && (
					<div className='flex items-center gap-4 flex-1 justify-center'>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(false)}
						>
							<FaChevronLeft />
						</div>
						<Link
							href='/'
							className='flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer'
						>
							<div>
								<BsList />
							</div>
							<p>Problem List</p>
						</Link>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(true)}
						>
							<FaChevronRight />
						</div>
					</div>
				)}

				<div className='flex items-center space-x-4 flex-1 justify-end'>
					<div>
						<a
							href='/code'
							target='_blank'
							rel='noreferrer'
							className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
						>
							Playground
						</a>
					</div>
					{!user && (
						<Link
							href='/auth'
							onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }))}
						>
							<button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
						</Link>
					)}
					{user && problemPage && !contestId &&  <Timer />}
					{user && problemPage && contestId &&  <Stopwatch startTime={start} duration={duration}/>}
					{user && (
						<div className='cursor-pointer group relative'>
							<Image src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
							<div
								className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg 
								z-40 group-hover:scale-100 scale-0 
								transition-all duration-300 ease-in-out overflow-hidden w-[100px]'
							>
								<p className='text-sm'>{user.email}</p>
							</div>
						</div>
					)}
					{user && <Logout />}
				</div>
			</div>
		</nav>
	);
};
export default Topbar;
