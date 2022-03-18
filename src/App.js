import { React, useState } from "react";
import CreateInterview from "./CreateInterview";
import Random from "./Random";
import ScheduledInterviews from "./ScheduledInterviews";
function App() {
	const [page, setPage] = useState(2);
	const Header = () => {
		return (
			<div className=" h-16 bg-[#fff] text-[#1a3d3c] font-bold flex items-center">
				<div className="w-1/3 cursor-pointer ">
					<img
						className="w-40"
						src="https://assets.interviewbit.com/packs/images/logo.87a398.svg"
						alt="Logo"
					/>
				</div>
				<div className=" w-1/3 flex justify-between">
					<div
						onClick={() => setPage(1)}
						className="cursor-pointer border-[#fff] border-b-2 hover:border-[#00BABE] ">
						Create Interview
					</div>
					<div
						onClick={() => setPage(2)}
						className="cursor-pointer border-[#fff] border-b-2 hover:border-[#00BABE] ">
						Scheduled Interviews
					</div>
					<div
						onClick={() => setPage(3)}
						className="cursor-pointer border-[#fff] border-b-2 hover:border-[#00BABE] ">
						Update Interview
					</div>
				</div>
				<div className="w-1/3 flex justify-end mr-4">Admin</div>
			</div>
		);
	};
	return (
		<>
			<Header />
			<div className="flex justify-center items-center">
				{page == 1 && <CreateInterview />}
				{page == 2 && <ScheduledInterviews />}
				{/* {page == 3 && <Random />} */}
			</div>
		</>
	);
}

export default App;
