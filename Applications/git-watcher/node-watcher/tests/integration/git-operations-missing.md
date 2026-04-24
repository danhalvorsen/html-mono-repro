To effectively use Git for version control and collaboration, you should master a core set of commands that enable you to manage repositories, track changes, branch, and sync with remote servers. 
Here are the essential Git operations you must learn, categorized by function:
1. Setup and Initialization
These commands are used to start a new project or get an existing one. 
git init: Converts a local folder into a Git repository.
git clone <url>: Creates a local copy of a remote repository.
git config: Sets your username and email, which are attached to your commits. 
The GitHub Blog
The GitHub Blog
 +2
2. The Basic Workflow (Saving Changes)
These are the most frequently used commands in your daily work. 
git status: Shows which files are modified, staged, or untracked.
git add <file> or git add .: Adds files from the working directory to the staging area.
git commit -m "message": Saves the staged snapshot permanently in the local repository.
git log: Displays the commit history. 
The GitHub Blog
The GitHub Blog
 +3
3. Branching and Merging
Branching allows you to work on new features without breaking the main codebase.
git branch: Lists, creates, or deletes branches.
git checkout -b <branch-name> (or git switch -c): Creates a new branch and switches to it.
git merge <branch>: Combines changes from a specific branch into your current branch. 
about.gitlab.com
about.gitlab.com
 +4
4. Remote Repositories (Collaboration)
These commands help you share your code and collaborate with others. 
git push -u origin <branch>: Uploads local commits to a remote repository (like GitHub).
git pull: Fetches changes from the remote repository and merges them into your local branch.
git fetch: Downloads updates from a remote repository without merging them. 
DEV Community
DEV Community
 +1
5. Undoing Changes 
Mistakes are inevitable; these commands help you fix them. 
git stash: Temporarily shelves changes you aren't ready to commit.
git revert <commit-id>: Creates a new commit that reverses the changes of a previous commit, keeping history intact.
git reset --hard: Resets the current HEAD to a specific state (use with caution). 
freeCodeCamp
freeCodeCamp
 +4
Summary of Daily Workflow
git pull (update your local code)
git checkout -b feature-branch (start a new feature)
Modify files
git add . (stage files)
git commit -m "message" (save files)
git push origin feature-branch (share changes)
Open a Merge Request/Pull Request 
Top 12 Git commands every developer must know
10. juni 2024 — Top 12 Git commands every developer must know * Git config. After you install Git on your machine, the first thing you should do i...

The GitHub Blog
10 Git Commands Every Developer Should Know
19. jan. 2020 — Note: To understand this article, you need to know the basics of Git. * 1. Git clone. Git clone is a command for downloading exist...

freeCodeCamp
Basic Operations in Git - DEV Community
9. mars 2021 — There are almost five basic operations in Git. * Initializing. * Add. * Commit. * Pull. * Push. ... Let's continue. * Initializing...

DEV Community
