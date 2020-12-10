#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const files = require('./lib/ginit_files');
const github = require('./lib/ginit_github');
const repo = require('./lib/ginit_repo');

clear();

console.log(
	chalk.yellow(
		figlet.textSync('JC init', { horizontalLayout: 'full' })
		)
	);

if (files.directoryExists('.git')) {
	console.log(chalk.red('Already a Git Repository!'));
	process.exit();
}

const getGitHubToken = async () => {
	//Fetch token from config store
	let token = github.getStoredGithubToken();
	if(token) {
		return token;
	}

	//No token found, use credentials to access github account
	token = await github.getPersonalAccessToken();

	return token;
};

const run = async() => {
	try {
		//Retrieve & Set Authentication Token
		const token = await getGitHubToken();
		github.githubAuth(token);

		//Create remote repository
		const url = await repo.createRemoteRepo();

		//create .gitignore file
		await repo.createGitignore();

		//set up local repository and push to remote
		await repo.setupRepo(url);

		console.logl(chalk.green('All done!'));
	} catch(err) {
		if (err) {
			switch (err.status) {
				case 401:
					console.log(chalk.red('Could\'t log you in. Please provide correct credentials/token'));
					break;
				case 422:
					console.log(chalk.red('There is already a remote repository or token with the same name'));
					break;
				default:
					console.log(chalk.red(err));
			}
		}
	}
};

run();
