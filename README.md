# 🎓 NUST Offline Admissions Assistant

A **local, offline-capable admissions chatbot** designed to provide reliable answers to university applicants, even without an internet connection.

Built for performance, trust, and clarity, this system ensures students get **accurate, grounded, and calm guidance** when they need it most.

---

## 🚀 Overview

This application is an **offline admissions assistant** that:

* Works **fully without internet**
* Provides **accurate answers from a verified local dataset**
* Automatically **syncs and updates data when internet becomes available**
* Maintains a **fast, responsive, and minimal interface**

It is designed specifically for **admission queries and FAQs**, helping students navigate eligibility, tests, deadlines, and requirements without confusion.

---

## ⚙️ Core Features

### 📴 100% Offline Mode

* Runs entirely on local machine
* No dependency on APIs or cloud services
* Ensures reliability in low-connectivity environments

---

### 🔄 Smart Auto-Update (Online Sync)

* Detects when device reconnects to the internet
* Fetches latest admissions data from trusted sources
* Updates local dataset automatically
* Keeps system **current without compromising offline capability**

---

### 🧠 Grounded Answering System

* Answers are retrieved from a **structured local dataset**
* No hallucinations or guesswork
* Priority-based matching ensures:

  * Exact FAQ answers are returned as-is
  * No incorrect keyword-based responses

---

### 🎯 Intent-Aware Query Handling

* Understands user intent (e.g., eligibility, deadlines, tests)
* Matches queries semantically rather than by keywords
* Reduces incorrect or misleading answers

---

### ⚡ Fast Performance

* Optimized for low-resource systems:

  * ≤ 8GB RAM
  * CPU-only (no GPU required)
* Response time designed to feel **instant and smooth**

---

### 🧘 Calm & Trustworthy UX

* Minimal interface to reduce cognitive load
* Structured responses:

  * Direct answer
  * Supporting detail (if applicable)
  * Confidence indication
* Honest fallback when data is unavailable

---

## 🏗️ System Architecture

```
User Query
   ↓
Intent Classification
   ↓
Local Data Retrieval (FAQ / Admissions Data)
   ↓
Response Generator (Template-based / Optional Lightweight Model)
   ↓
UI Output (Answer + Confidence + Source)
```

---

## 📂 Data Handling

* Stored locally using:

  * JSON / SQLite
* Includes:

  * FAQs
  * Eligibility criteria
  * Program details
  * Test information (NET, SAT, etc.)
  * Policies and rules

### 🔁 Update Flow

1. App runs offline using local dataset
2. Internet connection detected
3. Fetch latest data from predefined sources
4. Validate and update local storage
5. Continue offline usage with updated data

---

## 🛡️ Design Principles

* **Accuracy over creativity**
* **Clarity over complexity**
* **Trust over impressiveness**



---

## 🧪 Example Queries

* “What is the minimum percentage required for admission?”
* “Is there negative marking in NET?”
* “Can pre-medical students apply for CS?”
* “When is the last date to apply?”

---

## ⚠️ Limitations

* Only answers based on **available local data**
* Will respond with:

  > “I don’t have verified offline data for this question.”
  > when unsure
* Requires internet connection **only for updates**, not for operation

---

## 🛠️ Tech Stack (Example)


* Data: JSON 
* Frontend: HTML/CSS/JS (offline-first)

---

## 📦 Setup (Basic)

Install Node.js.
Open a terminal in the project folder.
Type npm install and then npm run dev.


---

## 🧩 Future Improvements

* Better semantic search (FAISS)
* Multi-university support
* Voice-based interaction (offline)
* More robust update validation system

---

## 🤝 Contribution

This project is designed for experimentation in:

* Offline AI systems
* Human-centered chatbot design
* Reliable information retrieval

Feel free to fork, improve, and adapt.

---

## 📌 Final Note

This system is not designed to impress with intelligence —
it is designed to **earn trust through reliability**.

---
