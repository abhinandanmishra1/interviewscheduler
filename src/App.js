import { React, useState } from "react";
import CreateInterview from "./CreateInterview";
import ScheduledInterviews from "./ScheduledInterviews";
import UpdateInterview from "./UpdateInterview";
function App() {
	const [page, setPage] = useState(2);
	const customClass = "border-b-4 border-teal-500 mt-1";
	const necessaryClasses =
		"cursor-pointer p-2 hover:bg-teal-700  text-sm md:text-base hover:text-white md:font-bold rounded-sm hover:rounded-xl ";
	const Header = () => {
		return (
			<div className=" h-16 bg-[#fff] text-[#1a3d3c] font-bold flex items-center border-b-2 mb-2">
				<div className="w-1/3 cursor-pointer ml-2 hidden sm:block">
					<img
						className="md:w-40 w-28"
						src="https://assets.interviewbit.com/packs/images/logo.87a398.svg"
						alt="Logo"
					/>
				</div>
				<div className="ml-2 md:ml-0 md:w-1/3 w-2/3 flex justify-between">
					<div
						onClick={() => setPage(1)}
						className={necessaryClasses + (page == 1 ? customClass : "")}>
						Create Interview
					</div>
					<div
						onClick={() => setPage(2)}
						className={necessaryClasses + (page == 2 ? customClass : "")}>
						Scheduled Interviews
					</div>
					<div
						onClick={() => setPage(3)}
						className={necessaryClasses + (page == 3 ? customClass : "")}>
						Update Interview
					</div>
				</div>
				<div className="w-1/3  flex  justify-end items-center cursor-pointer mr-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
							clip-rule="evenodd"
						/>
					</svg>
					<a
						href="https://github.com/abhinandanmishra1/interviewscheduler"
						target="_blank"
						className="text-sm md:text-lg">
						Admin
					</a>
				</div>
			</div>
		);
	};
	return (
		<>
			<Header />
			<div className="flex flex-col justify-center items-center h-full">
				{page == 1 && <CreateInterview />}
				{page == 2 && <ScheduledInterviews />}
				{page == 3 && <UpdateInterview />}
			</div>
		</>
	);
}

export default App;
