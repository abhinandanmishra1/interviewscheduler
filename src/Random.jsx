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
function Random() {
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
This page is not correct 

			{users.map((user, index) => {
				return (
					<div key={index}>
						<h1>Name: {user.name}</h1>
						<h1>Email: {user.email}</h1>
					</div>
				);
			})}

			<h1>Interviews</h1>
			{console.log(interviews)}
			{interviews.map((interview) => {
				return (
					<Interview
						users={interview.users}
						name={interview.name}
						date={interview.date}
					/>
				);
			})}
		</div>
	);
}

export default Random;
