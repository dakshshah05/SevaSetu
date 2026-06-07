# ENHANCED PROJECT ABSTRACT: SEVASETU

**Project Title:** SevaSetu: A WebGL-Enhanced Civic Collaboration and Resource Optimization Ecosystem  
**Domain:** Cloud Computing, Web Application Engineering, Database Systems  
**Course Assignment:** 5th Semester Project Report — Cloudification & Migration Analysis  

---

## 1. Project Summary & Core Mission
**SevaSetu** is an event-driven, real-time civic collaboration web application designed to connect citizens, non-governmental organizations (NGOs), local businesses, and corporate sponsors into a unified social-welfare network. The platform features eight integrated functional modules:
1. **Ahaar Setu:** Redistribution of surplus food from restaurants to nearby volunteer networks.
2. **Swachh Setu:** Coordination of localized sanitation drives (Swachh Bharat Abhiyan) with photo-verification.
3. **Sahaayak Setu:** Volunteer onboarding, roster management, and administrative consoles for NGOs.
4. **Seva Rewards Store:** A gamified point-redemption marketplace for digital gift vouchers (Zepto, Swiggy, BookMyShow).
5. **Seva Tasks:** A skill-based task board (Graphic Design, Teaching, Writing) for micro-volunteering.
6. **Transparent Crowdfunding:** Public fundraising ledger with a chronological visual "Proof of Impact" feed.
7. **Emergency SOS Alerts:** Location-pinned high-priority warnings for low-lying or vulnerable areas requiring relief.
8. **Medicine Pool:** Surplus unexpired medicine donation registry for free community health clinics.

---

## 2. Cloud Computing Integration in SevaSetu
In this project, Cloud Computing serves as the primary operational backbone, shifting the system from a static standalone portal into a highly available, event-driven web application. Cloud computing is utilized across three main paradigms:
* **Database-as-a-Service (DBaaS):** Real-time data storage using Google Cloud Firestore. Since civic events (SOS alerts, food pickups) occur dynamically, Firestore’s WebSocket-based real-time listener model is leveraged. This eliminates continuous API polling and enables instantaneous state updates across all connected clients.
* **Serverless Backend (Backend-as-a-Service - BaaS & FaaS):** Authentication, storage, and hostings are managed serverlessly. User logins are handled via Firebase Authentication, avoiding the necessity of maintaining dedicated authentication servers, password encryption routines, or session storage.
* **Global Serverless Hosting & CDN:** Static assets (HTML, compiled CSS, and JS) are deployed to a serverless Content Delivery Network (CDN) at edge locations, ensuring low-latency loading times (sub-500ms globally) and high request throughput.

---

## 3. Comparative Cloud Services Analysis: AWS vs. Firebase
For a production-grade deployment, SevaSetu's architecture maps to services from both **Amazon Web Services (AWS)** and **Google Cloud (Firebase)**:

| System Component | AWS Service Equivalent | Firebase Service (Used) |
| :--- | :--- | :--- |
| **Authentication** | Amazon Cognito | Firebase Authentication |
| **Primary Database** | Amazon DynamoDB / AppSync | Cloud Firestore (NoSQL Document) |
| **Serverless Logic (FaaS)** | AWS Lambda | Firebase Cloud Functions |
| **Static Hosting & CDN** | AWS Amplify / Amazon S3 + CloudFront | Firebase Hosting |
| **Object Storage (Images)** | Amazon S3 | Firebase Storage |
| **Real-time Notifications** | Amazon SNS / Amazon Pinpoint | Firebase Cloud Messaging (FCM) |

### Technical Rationale for Selecting Firebase over AWS:
1. **Development Velocity & Real-time Integration:** Cloud Firestore provides a native Client SDK containing real-time listener methods (`onSnapshot`). To achieve the equivalent real-time event-streaming on AWS, one would need to configure AWS AppSync (GraphQL) or set up Amazon API Gateway with WebSockets backed by Lambda functions. This introduces significant architectural complexity and middleware boilerplate.
2. **Setup Overhead & Operational Friction:** AWS requires complex configuration of Identity and Access Management (IAM) policies, Virtual Private Clouds (VPC), and Security Groups. Firebase abstracts this infrastructure management, allowing a serverless database connection with single-line configuration objects, making it ideal for rapid academic prototyping and lightweight NGO operations.
3. **Cost Efficiency for Non-Profit Contexts:** Google Firebase offers a generous free tier (Spark Plan) including 50,000 free Firestore reads per day, 10 GB of hosting storage, and unlimited email/password authentication. AWS, while providing a 12-month free tier, operates on a strict pay-as-you-go model that poses risks of unexpected billing spikes for elastic traffic.

---

## 4. Architectural Migration & "Cloudification" Strategy
To transition SevaSetu into a cloud-agnostic, enterprise-level application capable of running across multiple infrastructure platforms (e.g., migrating from Firebase to AWS or self-hosted servers), the following migration blueprint is established:

### A. Code Refactoring via the Adapter Pattern
The data-access layer in `src/db.js` was designed using the **Adapter Design Pattern**. The client-side React components interact only with abstract asynchronous signatures (e.g., `DB.claimFoodPickup()`). Swapping the underlying database driver (from Firebase Firestore to AWS DynamoDB, MongoDB, or PostgreSQL) requires modifications *only* inside the `db.js` file, leaving the user interface and components completely untouched.

### B. Containerization (Docker)
To migrate the frontend and any eventual node-based backend microservices across systems seamlessly:
1. We package the Vite-React application into a lightweight **Docker container** using an alpine-node base image.
2. The container compiles the application into static bundles and serves them via an **Nginx** server running inside the container.
3. This Docker image can be deployed on any container orchestration platform (e.g., **AWS Elastic Container Service (ECS)**, **Google Kubernetes Engine (GKE)**, or self-hosted Docker environments) with identical execution environments.

### C. Infrastructure as Code (Terraform)
To avoid manual cloud setup, the infrastructure (storage buckets, DynamoDB tables, API Gateways, CDN records) is declared using **Terraform (IaC)** files. This allows us to spin up, modify, or tear down the entire backend environment on AWS or GCP with a single terminal command:
```bash
terraform apply
```
This guarantees consistent configuration across development, staging, and production environments, eliminating configuration drift.
