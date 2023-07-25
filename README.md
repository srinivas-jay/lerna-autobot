# GitHub Lerna Auto-Versioning Action

This GitHub Action automates the process of updating your package version, tagging, and publishing your package. It allows you to streamline the versioning process and ensure that your package is consistently updated and published.

## How it Works

The action is triggered on the merge of a main branch. Upon being triggered, it carries out the following steps:

1. **Create a new branch**: The action checks out a new branch for the version update.

2. **Run version update**: The action runs a specified command to update the version in `package.json`.

3. **Commit and push tags**: The action commits the version update, creates a git tag for the new version, and pushes the tag to the new branch.

4. **Create a pull request**: The action creates a pull request for the version update, allowing for review and merge when ready.

5. **Publish**: Once the version update is merged, the action runs a publish command to publish the updated package to npm, GitHub, or another configured location.

## Special Conditions

1. **Prevent recursion**: The action is designed to not run on the merge of its own commits to the main branch.

2. **Flexible versioning**: The versioning command is provided by the consumer. This allows for flexibility in the versioning process, whether you want to create a pre-release version, a patch, minor, or major version.

## Usage

1. **Specify the versioning command**: Provide the command to update the version in `package.json` according to your needs.

2. **Choose the branch for release**: Run this custom action on the desired branch. This could be the main branch, a release branch, or another branch as fits your workflow.

3. **Review and merge the pull request**: Once the action creates a pull request, review the changes and merge them when ready.

4. **Ensure necessary permissions**: Make sure the action has the necessary permissions to commit and push tags, create pull requests, and publish the package.

## Notes

This action assumes that every merge to the main branch constitutes a release-worthy increment of your software. If this isn't the case, you may want to consider a different approach, such as manually triggering the version update action when you're ready to create a new release.

---

This is a basic example and could be expanded upon based on the specific details of your action. It's important to provide clear and detailed instructions so that consumers of your action understand how to use it and what to expect.
