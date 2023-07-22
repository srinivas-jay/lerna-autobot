const { Octokit } = require('@octokit/rest');
const { exec } = require('@actions/exec');
const git = require('simple-git');
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
	try {
		// Get inputs
		const githubToken = core.getInput('github-token');
		const versionCommand = core.getInput('version-command');
		const publishCommand = core.getInput('publish-command');

		// Get the event that triggered the action
		const { context } = github;
		const event = context.eventName;

		// Set up Git
		const gitClient = git();
		await gitClient.addConfig('user.name', 'GitHub Action');
		await gitClient.addConfig('user.email', 'action@github.com');

		if (event === 'push') {
			// This is a push event, run the version command

			// Check out a new branch
			const newBranch = 'version-update';
			await gitClient.checkoutLocalBranch(newBranch);

			// Run the version command
			const versionCmd = versionCommand.split(' ');
			await exec.exec(versionCmd[0], versionCmd.slice(1));

			// Add changes to Git and commit
			await gitClient.add('./*');
			await gitClient.commit('Update package versions');

			// Push changes to the new branch
			await gitClient.push('origin', newBranch);

			// Create a pull request
			const octokit = new Octokit({ auth: githubToken });
			await octokit.pulls.create({
				owner: context.repo.owner,
				repo: context.repo.repo,
				title: 'Update package versions',
				head: newBranch,
				base: 'main'
			});
		} else if (
			event === 'pull_request' &&
			context.payload.pull_request.merged
		) {
			// This is a merged pull request event, run the publish command

			// Run the publish command
			const publishCmd = publishCommand.split(' ');
			await exec.exec(publishCmd[0], publishCmd.slice(1));
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
