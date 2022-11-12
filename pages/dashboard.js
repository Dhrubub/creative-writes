import { auth, db } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
	collection,
	onSnapshot,
	where,
	query,
	doc,
	deleteDoc,
	orderBy,
} from 'firebase/firestore';
import Message from '../components/message';
import { BsTrash2Fill } from 'react-icons/bs';
import { AiFillEdit } from 'react-icons/ai';
import Link from 'next/link';

export default function Dashboard() {
	const route = useRouter();
	const [user, loading] = useAuthState(auth);
	const [posts, setPosts] = useState([]);

	// See if user is logged in
	useEffect(() => {
		const getData = async () => {
			if (loading) return;
			if (!user) return route.push('/auth/login');
			const collectionRef = collection(db, 'posts');
			const q = query(
				collectionRef,
				where('user', '==', user.uid),
				orderBy('timestamp', 'desc')
			);

			const unsubscribe = onSnapshot(q, (snapshot) => {
				setPosts(
					snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
				);
			});
			return unsubscribe;
		};

		getData();
	}, [user, loading, route]);

	// Delete post
	const deletePost = async (id) => {
		const docRef = doc(db, 'posts', id);
		await deleteDoc(docRef);
	};

	return (
		<div>
			<h1> Your posts</h1>
			<div>
				{posts.map((post) => (
					<Message {...post} key={post.id}>
						<div className='flex gap-4'>
							<button
								className='text-pink-600 flex items-center justify-center gap-2 py-2 text-sm'
								onClick={() => deletePost(post.id)}
							>
								<BsTrash2Fill className='text-2xl' />
								Delete
							</button>
							<Link href={{ pathname: '/post', query: post }}>
								<button className='text-teal-600 flex items-center justify-center gap-2 py-2 text-sm'>
									<AiFillEdit className='text-2xl' /> Edit
								</button>
							</Link>
						</div>
					</Message>
				))}
			</div>
			<button
				className='font-medium text-white bg-gray-800 py-2 px-4 my-6 rounded-lg'
				onClick={() => auth.signOut()}
			>
				Sign out
			</button>
		</div>
	);
}
