import React from "react";
import { Info, Repos, User, Search, Navbar } from "../components";
import loadingImage from "../images/preloader.gif";
// import { GithubContext } from "../context/context";
import { useGlobalContext } from "../context/context";
const Dashboard = () => {
	const { loading } = useGlobalContext();

	if (loading) {
		return (
			<main>
				<Navbar />
				<Search />
				<img src={loadingImage} alt='loading' className='loading-img' />
			</main>
		);
	} else {
		console.log("running");
	}
	return (
		<main>
			<Navbar />
			<Search />
			<Info />
			<User />
			<Repos />
		</main>
	);
};

export default Dashboard;
