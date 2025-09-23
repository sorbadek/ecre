<div align="center">
  <img src="./public/peerverse-logo-horizontal.png" alt="PeerVerse Architecture" width="800"/>
</div>


## **What is PeerVerse?**
**PeerVerse** is a decentralized peer-to-peer learning platform built fully onchain. It enables learners and educators to connect directly, share knowledge in real time, and earn recognition and rewards without relying on centralized intermediaries.

**The Problem**
Traditional online learning platforms are centralized, costly, and often limit ownership of knowledge. Credentials can be forged or locked behind proprietary systems, and learners lack a transparent way to showcase verifiable achievements. Educators, on the other hand, struggle to gain fair recognition and compensation for their contributions.

**Our Solution**
Peerverse puts control back in the hands of the community. By leveraging blockchain technology on the Internet Computer (ICP), Peerverse ensures:

* **Verifiable on-chain credentials** that learners can own and carry across platforms.
* **Transparent reputation systems** where merit and participation are publicly visible.
* **Peer-to-peer incentives** that reward both learners and educators fairly.
* **Decentralized infrastructure** that removes single points of failure and censorship.

**Why Onchain & Why ICP**
Building Peerverse onchain guarantees trust, transparency, and ownership. We chose ICP because it offers:

* Internet Identity for seamless and secure logins.
* Low-cost, scalable canister smart contracts for real-time interactions.
* Native on-chain storage, making verifiable credentials possible without external databases.
* The ability to run frontend and backend logic fully onchain, ensuring decentralization at every layer.

Peerverse is not just a learning app — it’s a movement towards an **open, verifiable, and community-owned education ecosystem**.


## 2. Key Features

### 🎥 Live Sessions

Real-time, interactive classes hosted directly on Peerverse.

* **For learners:** Join peer-led or expert-led sessions without intermediaries.
* **For educators:** Host live discussions, workshops, or tutorials and earn reputation + token incentives.
* **Tech:** Sessions are coordinated via canisters on ICP, ensuring reliability and transparent participation records.

### 📚 Micro-Classes

Bite-sized learning units that make knowledge sharing faster and more flexible.

* **For learners:** Consume focused lessons at your own pace.
* **For educators:** Easily publish modular content and get rewarded based on engagement.
* **Tech:** Micro-classes are stored and referenced onchain, enabling verifiable ownership and versioning.

### ❓ Community Q\&A

A decentralized knowledge exchange forum.

* **For learners:** Ask questions, get reliable answers, and upvote the best contributions.
* **For educators/experts:** Share expertise, build reputation, and gain recognition.
* **Tech:** Onchain reputation tracking ensures that contributors’ credibility grows transparently over time.

### ⭐ Reputation System

A merit-based recognition system that values contribution and quality.

* **For learners:** Earn reputation points by engaging meaningfully.
* **For educators:** Build authority through consistent teaching and knowledge sharing.
* **Tech:** Reputation scores are stored onchain, making them tamper-proof and portable across future dApps.

### 🎓 On-Chain Credentials

Verifiable digital records of participation and achievement.

* **For learners:** Showcase skills and completed courses with blockchain-backed credentials.
* **For employers/partners:** Instantly verify authenticity without relying on third parties.
* **Tech:** Credentials are minted and stored on ICP, ensuring permanence and trustworthiness.

### 💎 Token Incentives

An integrated token system to power participation and reward contributions.

* **For learners:** Earn tokens by completing classes, participating in Q\&A, and engaging with content.
* **For educators:** Get rewarded fairly for teaching, content creation, and community leadership.
* **Tech:** Tokenomics are implemented via canister smart contracts, ensuring fairness and decentralization.


## 3. Architecture Overview

<div align="center">
  <img src="./public/peerverse_architecture_v2.png" alt="PeerVerse Architecture" width="800"/>
</div>

Peerverse is designed as a fully onchain, decentralized learning ecosystem. Its architecture combines a modern web experience with blockchain-powered backend logic and decentralized infrastructure for media handling.

### 🖥️ Frontend – **Next.js**

* The user interface is built with **Next.js**, providing a fast, responsive, and scalable web application.
* It serves learners, educators, and community members with smooth navigation, interactive dashboards, and real-time updates.
* Hosting can be fully onchain via ICP’s boundary nodes, ensuring end-to-end decentralization.

### ⚙️ Backend – **Motoko Smart Contracts (Canisters)**

* Core logic for Peerverse (sessions, credentials, reputation, incentives) is powered by **Motoko smart contracts** deployed as ICP canisters.
* Each interaction (e.g., creating a class, issuing credentials, updating reputation) is recorded and executed onchain.
* This ensures **transparency, immutability, and verifiability** of all learning activities.

### 🎥 Video Conferencing – **Jitsi + Jibri**

* **Jitsi Meet** powers real-time video sessions with end-to-end encryption.
* **Jibri** handles session recording and streaming capabilities.
* Integrated with ICP canisters for decentralized session management and recording storage.
* Supports multiple session types: video calls, webinars, and screen sharing.

### 🗃️ Decentralized Storage – **IC + IPFS**

* Session recordings and learning materials are stored in a hybrid model.
* **Internet Computer (IC) canisters** manage metadata and access control.
* **IPFS** provides distributed content-addressable storage for media files.
* Ensures data permanence and censorship resistance.

### 🔐 Identity & Authentication – **Internet Identity**

* Seamless, passwordless authentication via **Internet Identity**.
* No personal data collection required.
* Secure key management with hardware security module (HSM) integration.
* Privacy-preserving authentication for all platform interactions.

## 4. Getting Started

* Peerverse integrates **Jitsi** for live, peer-to-peer video sessions.
* **Jibri** handles session recording, enabling playback and archiving of micro-classes.
* These tools allow for **real-time communication** while keeping Peerverse decentralized and flexible.

### 🗄️ Storage – **ICP Ecosystem**

* User data, credentials, reputation scores, and class metadata are stored on the **ICP blockchain**.
* This eliminates dependence on centralized servers or third-party storage solutions.
* Onchain storage ensures learners and educators fully **own their data and credentials**.

### 🔗 Data Flow Summary

1. A user interacts with the **Next.js frontend**.
2. Requests are routed to **Motoko canisters** that manage logic for sessions, credentials, tokens, and reputation.
3. **Jitsi** handles the live video connection, while **Jibri** records sessions for later playback.
4. All session metadata, credentials, and user reputation updates are permanently stored in the **ICP ecosystem**.

## 4. Features

Peerverse introduces a new way to learn, teach, and earn recognition, powered by onchain verification and community-driven evaluation.

### 🎥 Live Sessions

* **Description:** Real-time, interactive classes where learners and educators connect directly.
* **How It Works:**

  * Video is handled by **Jitsi** with **Jibri** for recording.
  * Attendance and participation are logged onchain in **Motoko canisters**.
  * After a session, participants receive **XP** (experience points) and **reputation updates**.

### 📚 Micro-Classes

* **Description:** Short, modular learning units for flexible peer-to-peer knowledge sharing.
* **How It Works:**

  * Created by educators and stored onchain in **ICP canisters**.
  * Learners earn **XP** when they complete or engage with content.
  * Educators gain **reputation** based on community feedback (upvotes/downvotes).

### ❓ Community Q\&A

* **Description:** A decentralized forum for asking and answering questions.
* **How It Works:**

  * Every interaction (question, answer, comment) is logged by **canister contracts**.
  * Helpful answers earn **upvotes**, boosting the contributor’s reputation.
  * Poor or misleading contributions can be **downvoted**, reducing the associated XP.

### ⭐ Reputation & XP System

* **XP (Experience Points):**

  * **Learners** spend XP as they take classes, meaning **knowledge comes at the cost of XP**.
  * **Educators** earn XP when they teach or upload materials.
  * XP acts as a **dynamic balance**: it decreases with consumption and increases with contribution.

* **Reputation Points:**

  * Awarded automatically when content is created or sessions are hosted.
  * Adjusted based on **upvotes and downvotes** from the community:

    * Upvotes maintain or boost the reputation score.
    * Downvotes reduce it, signaling low-quality or misleading content.
  * Reputation is **long-term, merit-based recognition** and may evolve into a **tokenized reward system in the future**.

### 🎓 On-Chain Credentials

* **Description:** Immutable, verifiable records of learning and teaching achievements.
* **How It Works:**

  * Credentials are minted on ICP canisters when learners complete sessions or courses.
  * These records are **publicly verifiable** and can be used as proof of skills anywhere.


## 5. Getting Started & Deployment

### 👩‍🎓 For Users

Peerverse is built to make decentralized learning easy, even if you’re new to Web3.

**1. Accessing Peerverse**

* Visit the Peerverse web app.
* Log in with **Internet Identity** — no email, no passwords, just secure blockchain-based authentication.

**2. Learning as a User**

* Explore **live sessions**, **micro-classes**, and **community Q\&A**.
* Spend **XP** to join classes or access materials.
* Earn **onchain credentials** after completing verified courses.

**3. Teaching as an Educator**

* Host **live sessions** via Peerverse’s Jitsi integration.
* Upload micro-classes or knowledge materials.
* Earn **XP and reputation points** automatically.
* Reputation grows or decreases based on **community upvotes/downvotes**.

**4. Engaging with the Community**

* Ask and answer questions in the community forum.
* Earn credibility and reputation through helpful contributions.
* Build a verifiable record of skills and participation onchain.

---

### 👨‍💻 For Developers

Peerverse is open-source and welcomes contributors to improve the decentralized learning ecosystem.

**1. Prerequisites**

* [Node.js](https://nodejs.org/) (v18+)
* [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/quickstart/dfx-install)
* Git & npm/yarn
* Basic understanding of **Motoko**

**2. Clone the Repository**

```bash
git clone https://github.com/sorbadek/ecre.git
cd peerverse
```

**3. Install Dependencies**

```bash
npm install --legacy-peer-deps
```

**4. Start Local ICP Environment**

```bash
dfx start --background
```

**5. Deploy Canisters Locally**

```bash
dfx deploy
```

**6. Run the Frontend (Next.js)**

```bash
npm run dev
```

* Visit `http://localhost:3000` to explore Peerverse locally.

---

### 🚀 Deployment

Peerverse runs entirely on the **ICP ecosystem**. Deployment involves pushing both the **frontend** and **backend canisters** to the Internet Computer.

**1. Prepare for Deployment**

* Make sure you are authenticated with your Internet Identity.
* Ensure your `dfx.json` config is updated with mainnet settings.

**2. Deploy to ICP Mainnet**

```bash
dfx deploy --network ic
```

**3. Canister IDs**

* After deployment, canister IDs will be generated for:

  * **Frontend Canister** (serving the Next.js app)
  * **Backend Canisters** (Motoko smart contracts for XP, reputation, credentials, sessions)

**4. Accessing the Mainnet App**

* Once deployed, the frontend canister URL (e.g., `https://<canister-id>.ic0.app`) will serve Peerverse globally.




## 6. ICP Features Used

Peerverse is fully powered by the **Internet Computer Protocol (ICP)**, leveraging its unique capabilities to deliver a decentralized, scalable, and user-friendly peer-to-peer learning experience.

### 🔐 Internet Identity

* **What it does:** Provides secure, passwordless authentication.
* **How Peerverse uses it:**

  * Users log in with Internet Identity to access sessions, classes, and community features.
  * Educators use it to authenticate when uploading materials or hosting live sessions.
  * Ensures privacy while removing the need for traditional logins.

### 🛠️ Canister Smart Contracts (Built in Motoko)

* **What it does:** Core logic of decentralized applications.
* **How Peerverse uses it:**

  * Session management (live classes, attendance records).
  * Credential issuance and verification.
  * XP + reputation tracking (dynamic, onchain, tamper-proof).
  * Q\&A system (questions, answers, votes stored and validated onchain).

### 💾 On-Chain Storage

* **What it does:** Stores data directly on ICP without relying on external databases.
* **How Peerverse uses it:**

  * Stores micro-class metadata, reputation scores, and issued credentials.
  * Saves participation logs from live sessions.
  * Keeps community Q\&A content immutable and verifiable.

### 🌐 Canister-Hosted Frontend

* **What it does:** Serves web apps directly from the blockchain.
* **How Peerverse uses it:**

  * The **Next.js frontend** is deployed as a canister, meaning Peerverse runs entirely onchain.
  * Eliminates reliance on centralized hosting providers.
  * Guarantees uptime and censorship resistance.

### 🔗 Interoperability & Extensibility

* **What it does:** ICP supports HTTP outcalls and cross-canister communication.
* **How Peerverse uses it:**

  * Cross-canister calls for modular system design (e.g., separating XP, reputation, credentials).
  * Potential future integration with external APIs for credential verification or institutional partnerships.


## 7. Challenges Faced

Building Peerverse was both exciting and demanding. As with any ambitious project, we encountered a mix of personal, resource, and technical challenges.

### 💸 Limited Funding

* One of the biggest hurdles was **lack of funds** to access premium tools, testing services, and infrastructure.

### 🎓 Balancing School & Development

* Peerverse was built alongside **academic responsibilities and exams**, leading to time management conflicts.

### 🏥 Health Challenges

* Periodic **health issues** slowed down productivity during critical phases.

### ⚡ Power Outages

* Frequent **electricity outages** disrupted development sessions and live testing.

### 🛠️ Technical Challenges

* **Real-time Video Integration:** Jitsi + Jibri integration with an onchain backend required careful design.
* **Onchain Storage Limitations:** Large video content could not be stored directly onchain.
* **User Experience:** Onboarding non-Web3 users was difficult given the concepts of Internet Identity, XP, and canisters.
* **Reputation & XP Algorithm:** Designing a **fair system** where XP reduces with learning but increases with teaching, and reputation adapts to upvotes/downvotes, took multiple iterations.
* **Scalability:** Preparing Peerverse to handle many sessions, credentials, and micro-classes without performance loss.

---

### ✅ How We Overcame Them

* **Funding:** Leveraged free tiers of open-source tools, relied on the ICP ecosystem’s native capabilities (onchain storage, hosting, authentication) to avoid high costs.
* **School vs. Development:** Adopted strict time-blocking and prioritized critical features to meet deadlines despite exams.
* **Health & Well-being:** Distributed tasks among team members and worked in flexible sprints to maintain steady progress.
* **Power Outages:** Used backup mobile internet and power banks to keep coding sessions active, and synced work on GitHub for continuity.
* **Video Integration:** Separated **live streaming** (offchain with Jitsi/Jibri) from **onchain metadata** to achieve balance between decentralization and performance.
* **Storage Issues:** Stored only **metadata and credentials** on ICP while linking session recordings efficiently.
* **UX Improvements:** Built simple flows for Internet Identity login and abstracted Web3 complexities with familiar UI patterns.
* **Reputation & XP:** Implemented a **progressive algorithm** where XP and reputation are automatically adjusted based on contributions and peer feedback.
* **Scalability:** Designed with **modular canisters**, allowing different functions (sessions, XP, reputation, credentials) to scale independently.

## 8. Roadmap

Peerverse has reached an MVP stage with **core features live**:

* **Sessions:** Real-time learning and teaching via Jitsi integration.
* **Profiles & Socials:** Basic user profiles, connection features, and community interaction.

### 🗓️ Next 3 Months (MVP Expansion)

* **Recommendation Engine:** Personalized session and content suggestions using reputation + activity.
* **NFT Learning Model:** Prototype of NFT-based micro-credentials that represent learning achievements.
* **Improved Reputation & XP System:** Refining the algorithm with fairer weight distribution and fraud-prevention.
* **UX/UI Enhancements:** Smoother onboarding and gamified learning/teaching dashboards.

### 🚀 6–12 Months (Growth Phase)

* **User Adoption Strategy:**

  * Onboarding student communities and local study groups.
  * Partnerships with universities, online educators, and community DAOs.
  * Reward systems to incentivize early contributors and active teachers.
* **Expanded Content Formats:** Beyond live sessions — support for micro-courses, community Q\&A, and peer-reviewed materials.
* **Onchain Credentials:** Launching verifiable certificates stored on ICP that can be showcased outside Peerverse.
* **Mobile Experience:** Lightweight mobile-friendly interface for wider accessibility.

### 🌍 Long-Term Vision (Beyond 12 Months)

* **Decentralized Learning Marketplace:** Educators can monetize knowledge directly, learners earn XP + credentials.
* **Tokenization of Reputation (Future Consideration):** Explore turning **reputation points** into transferable, utility-backed tokens.
* **Ecosystem Growth:** Multi-language support, integration with other ICP dApps, and global peer-to-peer adoption.
* **Funding & Sustainability:**

  * Apply for **grants** (DFINITY, EdTech accelerators).
  * Explore **partnerships with NGOs** focused on education access.
  * Monetization through **premium credential NFTs**, sponsored content, and institutional partnerships.



## 9. Contribution & Community

Peerverse is designed as a **community-driven learning ecosystem**. We believe knowledge grows stronger when shared, refined, and co-created.

### 🤝 How to Contribute

* **Developers:** Contribute to our open-source codebase, suggest improvements, and build features.
* **Educators:** Host live sessions, upload materials, and provide peer reviews.
* **Learners:** Join sessions, test new features, and share feedback on usability.
* **Community Members:** Promote Peerverse on social channels, invite friends, and engage in discussions.

### 📢 Community Channels

* **X (Twitter):** [@sorbadek](https://x.com/sorbadek)
* **Email Contact:** [madeleke035@uniport.edu.ng](mailto:madeleke035@uniport.edu.ng)
* **Hackathons & Meetups:** Early adopters can test new features and provide live feedback.

Our early testers (about 20 community members physically with us) continuously help validate new features before wider rollout.

---

## 10. License

Peerverse’s codebase is made available under a **Non-Commercial Open Source License**.

* **What this means:**

  * You are free to view, fork, and contribute to the code.
  * You **cannot use Peerverse code for commercial purposes** without explicit permission.
  * Any derivative works must also remain non-commercial.

> *(Technically, this aligns with a [Creative Commons Attribution-NonCommercial (CC BY-NC)](https://creativecommons.org/licenses/by-nc/4.0/) style license, though adapted for code.)*

---

## 11. Acknowledgements

We would like to thank:

* **DFINITY & ICP Ecosystem** for providing the infrastructure that makes decentralized learning possible.
* **Jitsi & Jibri Open Source Community** for enabling real-time video conferencing and recording.
* **Early Peerverse Testers** (about 20 active participants) for continuous feedback and validation.
* **Open-Source Communities** whose libraries, frameworks, and tools made development possible.
* **Peerverse Team & Supporters** who contributed time, ideas, and encouragement despite challenges.
