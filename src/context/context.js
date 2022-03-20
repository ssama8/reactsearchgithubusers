import React, { useState, useEffect, useContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();
const GithubProvider = ({ children }) => {
	const [githubUser, setGithubUser] = useState(mockUser);
	const [repos, setRepos] = useState(mockRepos);
	const [followers, setFollowers] = useState(mockFollowers);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState({ show: false, msg: "" });
	const [requests, setRequest] = useState({ limit: 0, remaining: 0 });

	const searchGithubUser = async (user) => {
		toggleError();
		//set loading
		setLoading(true);
		const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
			console.log(err)
		);

		if (response) {
			setGithubUser(response.data);
			const { login, followers_url } = response.data;

			await Promise.allSettled([
				axios(`${rootUrl}/users/${login}/repos?per_page=100`),
				axios(`${followers_url}?per_page=100`),
			])
				.then((results) => {
					const [repos, followers] = results;
					const status = "fulfilled";
					if (repos.status === status) {
						console.log(repos);
						setRepos(repos.value.data);
					}
					if (followers.status === status) {
						setFollowers(followers.value.data);
					}
				})
				.catch((err) => {
					toggleError(true, "user not found");
				});
		} else {
			toggleError(true, "user not found");
		}
		setLoading(false);
		getRateLimit();
	};

	//checking rate
	const getRateLimit = async () => {
		setLoading(true);

		const response = axios(`${rootUrl}/rate_limit`).catch((err) =>
			console.log(err)
		);
		const { data: rate } = await response;
		// console.log(rate.rate.limit);

		setRequest({ limit: rate.rate.limit, remaining: rate.rate.remaining });
		console.log(requests);

		if (rate.rate.remaining === 0 && error.msg !== "user not found") {
			toggleError(
				true,
				"sorry you've exceeded your rate limit, search more in an hour"
			);
		} else if (error.msg) {
			toggleError();
		}
		setLoading(false);
	};
	const toggleError = (show = false, msg = "") => {
		setError({ show, msg });
	};
	useEffect(() => {
		getRateLimit();
	}, []);
	return (
		<GithubContext.Provider
			value={{
				githubUser,
				repos,
				followers,
				requests,
				error,
				loading,
				searchGithubUser,
			}}>
			{children}
		</GithubContext.Provider>
	);
};

const useGlobalContext = () => {
	return useContext(GithubContext);
};

export { GithubProvider, GithubContext, useGlobalContext };
