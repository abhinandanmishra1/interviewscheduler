import { useState, useEffect, createElement } from "react";
import { db } from "./firebase-config";
import {
	collection,
	getDocs,
	updateDoc,
} from "firebase/firestore";
import Interview from "./Interview";

function ScheduledInterviews() {
	const [users, setUsers] = useState([]);

	const [interviews, setInterviews] = useState([]);

	const userCollectionRef = collection(db, "users");

	const interviewCollectionRef = collection(db, "interviews");

	useEffect(() => {
		//getting users
		const getUsers = async () => {
			// getDocs return all the documents from specific collection

			const data = await getDocs(userCollectionRef);
			setUsers(data.docs.map((doc) => ({ ...doc.data() }))); // doc.data() return all the objects
		};
		getUsers();
	}, []);

	useEffect(() => {
		//getting users
		const getInterviews = async () => {
			const data = await getDocs(interviewCollectionRef);
			setInterviews(data.docs.map((doc) => ({ ...doc.data() })));
		};
		getInterviews();
	}, );

	//setting users

	return (
		<div className="flex flex-col justify-center items-center">

			<h1 className="md:text-xl sm:text-lg text-base text-center font-bold mb-2">Scheduled Interviews</h1>
			<div className="flex flex-wrap w-full flex-col justify-center items-center md:flex-row md:justify-start md:items-start ">
            {
                interviews.map((interview) => {
                    return (
                        <Interview
                            users={interview.users}
                            name={interview.name}
                            date={interview.date}
                            start={interview.startTime}
                            end={interview.endTime}
                        />
                    );
                })
            }
			{interviews.length===0 && <div className="md:w-96 sm:w-80 w-64 h-40 ml-2 mt-2 border rounded-lg bg-[#030027] text-white flex flex-col justify-center items-center"> 
				No interviews are scheduled till now.
			</div>}
            </div>
		</div>
	);
}

export default ScheduledInterviews;
