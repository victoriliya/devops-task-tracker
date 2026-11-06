# 🚀 DevOps Lab: Task Tracker

A beginner-friendly project for learning **Docker** and **CI/CD with GitHub Actions**.

You'll take a small React app and:
1. Run it on your laptop
2. Package it into a **Docker image**
3. Run it with **Docker Compose**
4. Build an automated **pipeline** that tests, packages and ships every change
5. Break the pipeline on purpose and fix it
6. Deploy it to the internet

---

## 📁 What's in this project

```
devops-task-tracker/
├── src/                      ← the React app (you don't need to change this much)
│   ├── App.jsx               ← the Task Tracker screen
│   └── App.test.jsx          ← automated tests the pipeline runs
├── Dockerfile                ← recipe for building the Docker image
├── nginx.conf                ← web server settings used inside the container
├── .dockerignore             ← files Docker should skip
├── docker-compose.yml        ← run the app with one command
└── .github/workflows/
    └── pipeline.yml          ← the CI/CD pipeline (GitHub Actions)
```

---

## 🧠 Key ideas (read this first)

| Term | Plain-English meaning |
|---|---|
| **Docker image** | A sealed box holding your app plus everything it needs to run. |
| **Container** | A running copy of an image. Like running a program from an installer. |
| **Dockerfile** | The recipe used to build the image, step by step. |
| **Registry** | An online shelf where images are stored (we use GitHub Container Registry). |
| **CI** (Continuous Integration) | Every change is automatically checked: lint → test → build. |
| **CD** (Continuous Delivery) | Every approved change is automatically packaged and shipped. |
| **Workflow / Job / Step** | A workflow is the whole pipeline; it contains jobs; each job has steps. |
| **Smoke test** | A quick "does it even start?" check before shipping. |

The pipeline in this project:

```
 Pull Request ─► [1. Lint & Test] ─► [2. Docker Build + Smoke Test]   (stops here)

 Merge to main ─► [1. Lint & Test] ─► [2. Docker Build + Smoke Test + PUSH] ─► [3. Deploy]
```

---

## ✅ Lab 0: Install the tools

- [Git](https://git-scm.com/downloads)
- [Node.js 22 LTS](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), which must be **running**
- A free [GitHub](https://github.com/) account
- A code editor such as [VS Code](https://code.visualstudio.com/)

Check everything works:

```bash
git --version
node --version     # should start with v22
docker --version
```

---

## 🧪 Lab 1: Run the app without Docker

```bash
npm install        # download the libraries the app needs (creates package-lock.json)
npm run dev        # start the development server
```

> ⚠️ `npm install` creates **package-lock.json**. Keep it and commit it. The Dockerfile and the pipeline both use `npm ci`, which needs this file to install the exact same versions every time.

Open the link shown (usually http://localhost:5173). Add a task, tick one off, delete one.

Now run the same checks the pipeline will run:

```bash
npm run lint       # code quality check
npm test           # automated tests (you should see 5 passing)
npm run build      # creates the production files in /dist
```

> 💡 **Why this matters:** the pipeline runs these exact commands. If they pass on your laptop, they should pass in GitHub too.

---

## 🐳 Lab 2: Build and run with Docker

Open `Dockerfile` and read the comments. Notice there are **two stages**:
- **Stage 1** uses Node to *build* the app
- **Stage 2** uses Nginx to *serve* it, and leaves Node behind

Build the image:

```bash
docker build -t task-tracker:v1 .
```

Run a container from it:

```bash
docker run -d --name tracker -p 8080:80 task-tracker:v1
```

Open http://localhost:8080. The subtitle says `build docker-local`.
Check the health endpoint: http://localhost:8080/health should show `ok`.

Useful commands:

```bash
docker ps                  # list running containers
docker logs tracker        # see the container's output
docker images              # list images (look at the SIZE column)
docker stop tracker        # stop it
docker rm tracker          # remove it
```

**🎯 Exercise 2a:** Rebuild with a version stamp, then check the page shows it:
```bash
docker build -t task-tracker:v2 --build-arg APP_VERSION=v2 .
```

**🎯 Exercise 2b:** Look at the image size with `docker images`. Then ask yourself why it's so small when `node_modules` is hundreds of MB. *(Hint: multi-stage build.)*

---

## 🧩 Lab 3: Docker Compose

Typing long `docker run` commands gets tiring. Compose saves the settings in a file.

```bash
docker compose up --build      # build and start
# open http://localhost:8080
docker compose down            # stop and clean up
```

**🎯 Exercise 3:** Change the port in `docker-compose.yml` from `8080:80` to `3000:80`. Restart, and open http://localhost:3000.

---

## ⚙️ Lab 4: Your first pipeline

1. Create a **new empty repository** on GitHub (e.g. `devops-task-tracker`).
2. Push this project to it:
   ```bash
   git init
   git add .
   git commit -m "First commit: task tracker with Docker and CI/CD"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/devops-task-tracker.git
   git push -u origin main
   ```
3. On GitHub, open the **Actions** tab. You'll see **CI/CD Pipeline** running.
4. Click into it and watch the 3 jobs: **Lint & Test → Docker Build & Push → Deploy**.
5. When it's green ✅, go to your GitHub profile and open **Packages**. Your Docker image is there.

Pull and run the image the pipeline built:

```bash
docker pull ghcr.io/<your-username>/devops-task-tracker:latest
docker run -d -p 8080:80 ghcr.io/<your-username>/devops-task-tracker:latest
```

The subtitle now shows the **git commit ID**, so you can see exactly which build is running.

> If the pull is refused, open the package's settings on GitHub and set visibility to **Public**, or run `docker login ghcr.io` first.

---

## 💥 Lab 5: Break it on purpose (Pull Request workflow)

Real teams never push straight to `main`. They open a **Pull Request (PR)** and let the pipeline check it first.

1. Create a branch:
   ```bash
   git checkout -b break-the-build
   ```
2. In `src/App.jsx`, change `'Write a Dockerfile'` to `'Write a Dockerfil'` (a typo).
3. Commit, push, and open a Pull Request on GitHub:
   ```bash
   git commit -am "Introduce a typo"
   git push -u origin break-the-build
   ```
4. Watch the PR. **Job 1 fails** ❌ because the test expects `Write a Dockerfile`.
   Notice that **Job 2 never ran**. A broken app never gets packaged.
5. Click the failed job and find the error message. *(Reading logs is a core DevOps skill!)*
6. Fix the typo, commit and push again. The PR turns green ✅.
7. Merge the PR. Now the image is pushed and deploy runs.

**🎯 Exercise 5b:** Break the *Docker* stage instead. In `nginx.conf`, change `listen 80;` to `listen 81;`. Which job fails now, and why? *(Hint: the smoke test.)*

**🎯 Exercise 5c (optional):** Protect `main`: go to **Settings → Branches → Add rule**, tick *Require status checks to pass*, and select the pipeline jobs. Now nobody can merge a red PR.

---

## 🌍 Lab 6: Deploy to the internet (optional)

We'll use [Render](https://render.com) (free tier) to run the image.

1. Make your GHCR package **Public** (package settings on GitHub).
2. On Render: **New → Web Service → Existing image**, and enter
   `ghcr.io/<your-username>/devops-task-tracker:latest`. Set the port to **80**.
3. In the Render service settings, copy the **Deploy Hook** URL.
4. On GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: the URL you copied
5. Push any change to `main`. Job 3 now tells Render to pull the new image and redeploy. 🎉

> 🔐 **Why a secret?** The deploy hook URL is like a password. Secrets are hidden from logs and never stored in your code.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot connect to the Docker daemon` | Start Docker Desktop. |
| `port is already allocated` | Something else uses 8080. Stop it, or use `-p 8081:80`. |
| `npm ci` fails in Docker | Run `npm install` locally first so `package-lock.json` exists, then commit it. |
| Push to GHCR is denied | Repo **Settings → Actions → General → Workflow permissions**: choose *Read and write*. |
| Workflow doesn't run | The file must be at exactly `.github/workflows/pipeline.yml`. |

---

## 🏁 What you've learned

- Containerising a front-end app with a **multi-stage Dockerfile**
- Running containers with `docker run` and **Docker Compose**
- Writing a **GitHub Actions** pipeline with jobs that depend on each other
- Using **smoke tests** to stop broken images being shipped
- Pushing images to a **container registry** and tagging them with the commit
- Keeping credentials in **GitHub Secrets**

➡️ **Next:** the **DevSecOps Lab** (Patient Queue) adds security scanning at every stage of this same kind of pipeline.
