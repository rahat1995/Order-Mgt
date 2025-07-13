# Pushing Your Project to GitHub

This guide provides step-by-step instructions on how to publish your local project to a new repository on GitHub.

## Prerequisites

*   You have a GitHub account.
*   You have `git` installed on your local machine.

---

### Step 1: Create a New Repository on GitHub

1.  Go to [GitHub.com](https://github.com) and log in.
2.  In the upper-right corner of the page, click the `+` icon, and then select **New repository**.
3.  Name your repository (e.g., `my-restaurant-app`).
4.  Choose whether to make the repository **Public** or **Private**.
5.  **Important:** Do NOT initialize the new repository with a README, .gitignore, or license file. Your project already has these files, and checking this box can cause issues.
6.  Click **Create repository**.

After creating the repository, GitHub will show you a page with a URL that looks something like this: `https://github.com/your-username/your-repository-name.git`. Keep this page open.

---

### Step 2: Push Your Existing Project from the Command Line

Now, open a terminal or command prompt in your project's root directory and run the following commands one by one.

1.  **Initialize Git in your project folder:**
    *(This command creates a new, hidden `.git` directory in your project to start tracking your files. If it's already a Git repository, it will re-initialize it safely.)*

    ```bash
    git init -b main
    ```

2.  **Add all your project files to be tracked by Git:**
    *(The `.` means "all files and folders in the current directory".)*

    ```bash
    git add .
    ```

3.  **Commit your files:**
    *(This saves a snapshot of your files to your local Git history. The message describes the changes.)*

    ```bash
    git commit -m "Initial commit"
    ```

4.  **Link your local repository to the one on GitHub:**
    *(Replace the URL with the one from your new GitHub repository page.)*

    ```bash
    git remote add origin https://github.com/your-username/your-repository-name.git
    ```

5.  **Push your code to GitHub:**
    *(This command uploads your committed files to the `main` branch of your GitHub repository.)*

    ```bash
    git push -u origin main
    ```

---

That's it! If you refresh your GitHub repository page, you will see all of your project files. You can now continue working on your project and push future changes using `git add`, `git commit`, and `git push`.