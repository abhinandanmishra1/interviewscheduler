import { useState, useEffect, createElement } from "react";
import { db } from "./firebase-config";
import {
	collection,
	getDoc,
	getDocs,
	doc,
	updateDoc,
	addDoc,
} from "firebase/firestore";
import { async } from "@firebase/util";
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
	}, []);

	//setting users

	return (
		<div>

			<h1 className="text-xl text-center ">Scheduled Interviews</h1>
			<div className="flex justify-around flex-wrap w-full ">
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
            </div>
		</div>
	);
}

export default ScheduledInterviews;
