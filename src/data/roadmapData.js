export const roadmapData = {
  webdev: {
    title: "Web Development",
    description: "Master modern front-end and back-end web technologies to build scalable web applications.",
    nodes: [
      {
        id: "html-css",
        label: "HTML & CSS",
        description: "The structural and styling backbone of the web. Learn layout techniques, responsiveness, and semantic structures.",
        concepts: ["Semantic HTML", "CSS Grid & Flexbox", "Responsive Design (Media Queries)", "CSS Custom Properties"],
        docs: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        tutorials: [
          { title: "HTML/CSS Full Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=kUMe1FH4CHE" },
          { title: "CSS Flexbox Guide - CSS-Tricks", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
        ],
        practice: [
          { title: "Frontend Mentor Challenges", url: "https://www.frontendmentor.io" },
          { title: "Flexbox Froggy Game", url: "https://flexboxfroggy.com" }
        ]
      },
      {
        id: "javascript",
        label: "JavaScript (ES6+)",
        description: "Add interactivity, handle API requests, and learn modern programming principles using JavaScript.",
        concepts: ["DOM Manipulation", "Promises & Async/Await", "ES6+ Features", "Array Methods & Scope"],
        docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        tutorials: [
          { title: "JavaScript for Beginners - JavaScript.info", url: "https://javascript.info" },
          { title: "Modern JS Tutorial - Net Ninja", url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBXXbgIcFl2C6FUzHFFt5" }
        ],
        practice: [
          { title: "JavaScript Exercises - Exercism", url: "https://exercism.org/tracks/javascript" },
          { title: "JS practice challenges - Codewars", url: "https://www.codewars.com" }
        ]
      },
      {
        id: "git-versioning",
        label: "Git & Version Control",
        description: "Track code changes, collaborate seamlessly with teams, and master code repository management.",
        concepts: ["Git Branching & Merging", "Rebasing vs Merging", "Remote Repositories", "Conflict Resolution"],
        docs: "https://git-scm.com/doc",
        tutorials: [
          { title: "Git & GitHub Crash Course - Traversy Media", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" }
        ],
        practice: [
          { title: "Learn Git Branching Interactive Game", url: "https://learngitbranching.js.org" }
        ]
      },
      {
        id: "react",
        label: "React.js Framework",
        description: "Build reactive, modular frontend applications utilizing a component-based paradigm and virtual DOM.",
        concepts: ["JSX & Components", "State & Props", "Hooks (useEffect, useState)", "Context API & State Management"],
        docs: "https://react.dev",
        tutorials: [
          { title: "Official React Quick Start Guide", url: "https://react.dev/learn" },
          { title: "React JS Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" }
        ],
        practice: [
          { title: "Scrimba React Course Sandbox", url: "https://scrimba.com/learn/learnreact" }
        ]
      },
      {
        id: "backend-api",
        label: "Backend & Database APIs",
        description: "Architect secure servers, configure routing, and integrate databases to store dynamic data.",
        concepts: ["Node.js & Express", "RESTful Routing", "NoSQL (MongoDB) vs Relational SQL", "Authentication & JWT"],
        docs: "https://nodejs.org/en/docs",
        tutorials: [
          { title: "Node.js & Express Tutorial - FreeCodeCamp", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" }
        ],
        practice: [
          { title: "Building CRUD APIs - FreeCodeCamp", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis" }
        ]
      }
    ]
  },
  ai_ml: {
    title: "AI & Machine Learning",
    description: "From data wrangling to complex deep neural networks. Embark on the AI revolution.",
    nodes: [
      {
        id: "python-basics",
        label: "Python Programming",
        description: "The primary programming language of data science. Learn functional programming and data manipulation paradigms.",
        concepts: ["Data Structures (Lists, Dicts)", "OOP in Python", "File I/O", "Virtual Environments"],
        docs: "https://docs.python.org/3/",
        tutorials: [
          { title: "Python for Everybody - Coursera/FreeCodeCamp", url: "https://www.youtube.com/watch?v=8DvywoWv6fI" }
        ],
        practice: [
          { title: "Python Tracks - Hackerrank", url: "https://www.hackerrank.com/domains/python" }
        ]
      },
      {
        id: "math-foundation",
        label: "Mathematics & Statistics",
        description: "Understand the statistical modeling and algorithmic linear algebra that power complex ML predictions.",
        concepts: ["Linear Algebra (Matrices & Vectors)", "Calculus (Gradients & Derivatives)", "Probability Distributions", "Hypothesis Testing"],
        docs: "https://khanacademy.org/math",
        tutorials: [
          { title: "Mathematics for Machine Learning - Imperial College London", url: "https://www.coursera.org/specializations/mathematics-machine-learning" }
        ],
        practice: [
          { title: "Desmos Matrix Calculator Playground", url: "https://www.desmos.com/matrix" }
        ]
      },
      {
        id: "data-manipulation",
        label: "Data Science Libraries",
        description: "Clean, explore, and analyze heavy datasets with industry-standard libraries.",
        concepts: ["NumPy Array Operations", "Pandas DataFrames", "Data Visualization (Matplotlib & Seaborn)", "Handling Missing Values"],
        docs: "https://pandas.pydata.org/docs/",
        tutorials: [
          { title: "Pandas Full Tutorial - Keith Galli", url: "https://www.youtube.com/watch?v=vmEHCJof1kU" }
        ],
        practice: [
          { title: "Kaggle Micro-Courses", url: "https://www.kaggle.com/learn" }
        ]
      },
      {
        id: "machine-learning",
        label: "Classical Machine Learning",
        description: "Master regression, clustering, classification algorithms, and evaluate models for predictive analytics.",
        concepts: ["Supervised vs Unsupervised", "Regression & Decision Trees", "Scikit-Learn Integration", "Overfitting vs Underfitting"],
        docs: "https://scikit-learn.org/stable/",
        tutorials: [
          { title: "Machine Learning Zoomcamp - DataTalksClub", url: "https://github.com/DataTalksClub/machine-learning-zoomcamp" }
        ],
        practice: [
          { title: "Kaggle Playground Competitions", url: "https://www.kaggle.com/competitions" }
        ]
      },
      {
        id: "deep-learning",
        label: "Deep Learning & Neural Networks",
        description: "Model complex cognitive abstractions using Deep Learning, CNNs, and modern transformers.",
        concepts: ["Artificial Neural Networks", "Activation Functions", "TensorFlow & PyTorch Basics", "Natural Language Processing (NLP)"],
        docs: "https://pytorch.org/docs/stable/index.html",
        tutorials: [
          { title: "Deep Learning Specialization - Andrew Ng", url: "https://www.deeplearning.ai/courses/deep-learning-specialization/" }
        ],
        practice: [
          { title: "TensorFlow Playground (Interactive NN visualization)", url: "https://playground.tensorflow.org" }
        ]
      }
    ]
  },
  cloud: {
    title: "Cloud Computing",
    description: "Design highly-available, scalable systems using cloud services and robust DevOps techniques.",
    nodes: [
      {
        id: "networking-basics",
        label: "Networking & Linux Fundamentals",
        description: "Master IP routing, subnets, standard OS operations, and Bash scripting protocols.",
        concepts: ["OSI Model & TCP/IP", "Linux Terminal Commands", "Bash Scripting", "SSH & Key Authentication"],
        docs: "https://linux.org/docs",
        tutorials: [
          { title: "Linux Command Line Basics - freeCodeCamp", url: "https://www.youtube.com/watch?v=wBp0Rb-ZJak" }
        ],
        practice: [
          { title: "Linux Practice Arena - OverTheWire", url: "https://overthewire.org/wargames/bandit/" }
        ]
      },
      {
        id: "cloud-providers",
        label: "Cloud Infrastructures (AWS/GCP)",
        description: "Learn compute virtualization, modern object storage systems, and cloud permissions management.",
        concepts: ["Virtual Servers (EC2/Compute Engine)", "Storage Systems (S3/Cloud Storage)", "IAM Security Policies", "VPC & Subnets Configuration"],
        docs: "https://docs.aws.amazon.com",
        tutorials: [
          { title: "AWS Certified Cloud Practitioner - freeCodeCamp", url: "https://www.youtube.com/watch?v=SOTamWGuDKc" }
        ],
        practice: [
          { title: "AWS Free Tier Hands-On Labs", url: "https://aws.amazon.com/getting-started/hands-on/" }
        ]
      },
      {
        id: "containers",
        label: "Containers (Docker)",
        description: "Build robust, isolated runtime environments ensuring parity between local development and production systems.",
        concepts: ["Dockerfiles & Image Building", "Docker Volumes & Data Persistence", "Docker Compose Multi-Container", "Container Registries (DockerHub)"],
        docs: "https://docs.docker.com",
        tutorials: [
          { title: "Docker Course for Beginners - Nana Janashia", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" }
        ],
        practice: [
          { title: "Docker Playground Interactive Sandbox", url: "https://labs.play-with-docker.com" }
        ]
      },
      {
        id: "infrastructure-as-code",
        label: "Infrastructure as Code (Terraform)",
        description: "Declare, build, version, and manage virtual clouds cleanly using configuration code files.",
        concepts: ["Declarative Configs", "Terraform Providers & State Files", "Resource Provisioning", "Variables & Modules"],
        docs: "https://developer.hashicorp.com/terraform/docs",
        tutorials: [
          { title: "Terraform Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=SLB_c_ayRMc" }
        ],
        practice: [
          { title: "HashiCorp Hands-On Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" }
        ]
      },
      {
        id: "kubernetes",
        label: "Orchestration & Kubernetes (K8s)",
        description: "Deploy, auto-scale, load-balance, and manage cluster deployments in enterprise setups.",
        concepts: ["Pods & Deployments Services", "K8s Architecture & Control Planes", "Ingress Controllers", "Helm Charts for Package Management"],
        docs: "https://kubernetes.io/docs/home/",
        tutorials: [
          { title: "Kubernetes Tutorial for Beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do" }
        ],
        practice: [
          { title: "Play with Kubernetes Sandbox", url: "https://labs.play-with-k8s.com" }
        ]
      }
    ]
  },
  android: {
    title: "Android App Development",
    description: "Build responsive, premium native applications for mobile devices powered by Android.",
    nodes: [
      {
        id: "kotlin-basics",
        label: "Kotlin Programming",
        description: "Master the type-safe, concise, and standard language officially approved for modern Android apps.",
        concepts: ["Null Safety Syntax", "Coroutines & Async", "Object-Oriented Kotlin", "Data Classes & Collections"],
        docs: "https://kotlinlang.org/docs/home.html",
        tutorials: [
          { title: "Kotlin Bootcamp for Programmers - Udacity", url: "https://www.udacity.com/course/kotlin-bootcamp-for-programmers--ud9011" }
        ],
        practice: [
          { title: "Kotlin Playground online", url: "https://play.kotlinlang.org" }
        ]
      },
      {
        id: "android-studio",
        label: "Android Studio & XML Layouts",
        description: "Configure workspace structures, manage SDK configurations, and construct visual designs using XML.",
        concepts: ["Activity & Fragment Lifecycles", "ConstraintLayout Designs", "Views & ViewBinding", "Manifest & App permissions"],
        docs: "https://developer.android.com/studio/intro",
        tutorials: [
          { title: "Android Development Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=fis26HvvDII" }
        ],
        practice: [
          { title: "Codelabs for Android Basics", url: "https://developer.android.com/courses/android-basics-kotlin/course" }
        ]
      },
      {
        id: "jetpack-compose",
        label: "Jetpack Compose (Modern UI)",
        description: "Design beautiful, declarative UI layouts using native Kotlin modules without XML files.",
        concepts: ["Declarative UI paradigm", "State Hoisting & Remember", "Modifiers & Styling", "Compose Theme Customization"],
        docs: "https://developer.android.com/jetpack/compose",
        tutorials: [
          { title: "Jetpack Compose Tutorial - Philipp Lackner", url: "https://www.youtube.com/playlist?list=PLQkwcJGIPacTjWDXC8-VJkdyP8kPrus4v" }
        ],
        practice: [
          { title: "Jetpack Compose Pathways", url: "https://developer.android.com/courses/pathways/compose" }
        ]
      },
      {
        id: "networking-persistence",
        label: "Data Fetching & Local Databases",
        description: "Fetch real-time data using Retrofit APIs and manage persistent local caches using Room SQL databases.",
        concepts: ["Retrofit API integrations", "JSON serialization (Gson/Moshi)", "Room Database & DAOs", "Repository Design Pattern"],
        docs: "https://developer.android.com/training/data-storage/room",
        tutorials: [
          { title: "Retrofit & Room Tutorial - Philipp Lackner", url: "https://www.youtube.com/watch?v=tI99ZcR6Z7Y" }
        ],
        practice: [
          { title: "Building a caching News App from scratch", url: "https://developer.android.com/codelabs/basic-android-kotlin-training-room-database" }
        ]
      },
      {
        id: "architecture-patterns",
        label: "Android Architecture (MVVM)",
        description: "Create highly testable, decoupled apps using clean MVVM architectures and robust Dependency Injection (Hilt).",
        concepts: ["MVVM architecture pattern", "LiveData & StateFlow", "Hilt Dependency Injection", "Unit Testing ViewModels"],
        docs: "https://developer.android.com/topic/architecture",
        tutorials: [
          { title: "Hilt Dependency Injection Course", url: "https://www.youtube.com/watch?v=kiN4Fp9Z0hI" }
        ],
        practice: [
          { title: "Refactoring standard structures to MVVM Hilt", url: "https://developer.android.com/codelabs/android-hilt" }
        ]
      }
    ]
  },
  cybersecurity: {
    title: "Cybersecurity",
    description: "Guard network borders, secure web instances, and master penetration testing tactics.",
    nodes: [
      {
        id: "security-networking",
        label: "Network Protocols & Analysis",
        description: "Deep dive into routers, switches, network packets, and traffic sniffing methods.",
        concepts: ["Subnets & IP Addressing", "Common Ports (SSH, HTTP, FTP)", "Packet Sniffing (Wireshark)", "IDS/IPS Systems"],
        docs: "https://www.wireshark.org/docs/",
        tutorials: [
          { title: "Cybersecurity Foundations - NetworkChuck", url: "https://www.youtube.com/playlist?list=PLIhvC56v6wQYk2qM2G0fXUu2W1aGv7jLh" }
        ],
        practice: [
          { title: "Analyzing PCAP files - Wireshark practice", url: "https://www.wireshark.org/download.html" }
        ]
      },
      {
        id: "system-security",
        label: "Linux Security & Scripting",
        description: "Configure absolute host protections, manage user/group privileges, and create automation scripts.",
        concepts: ["Access Control Lists (ACLs)", "Firewall configuration (UFW/IPTables)", "Privilege Escalation paths", "Python for OS Automation"],
        docs: "https://tldp.org/LDP/sag/html/index.html",
        tutorials: [
          { title: "Linux Privilege Escalation - Tib3rius", url: "https://www.udemy.com/course/linux-privilege-escalation/" }
        ],
        practice: [
          { title: "Linux Wargames - OverTheWire Bandit", url: "https://overthewire.org" }
        ]
      },
      {
        id: "web-app-pentesting",
        label: "Web Application Security (OWASP Top 10)",
        description: "Audit frontend interfaces and backend configurations to mitigate SQL injections, XSS, and broken authentications.",
        concepts: ["SQL Injection (SQLi)", "Cross-Site Scripting (XSS)", "CSRF & Broken Auth", "Burp Suite Proxies"],
        docs: "https://owasp.org/www-project-top-ten/",
        tutorials: [
          { title: "OWASP Top 10 tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=2fFEQD3A158" }
        ],
        practice: [
          { title: "DVWA (Damn Vulnerable Web App)", url: "https://github.com/digininja/DVWA" },
          { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }
        ]
      },
      {
        id: "penetration-testing",
        label: "Penetration Testing (Ethical Hacking)",
        description: "Discover network vulnerabilities, execute payloads, bypass firewalls, and document findings.",
        concepts: ["Reconnaissance (Nmap)", "Vulnerability Scanning", "Metasploit Framework", "Post-Exploitation Tactics"],
        docs: "https://www.offensive-security.com",
        tutorials: [
          { title: "Ethical Hacking Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" }
        ],
        practice: [
          { title: "TryHackMe Learning Paths", url: "https://tryhackme.com" },
          { title: "Hack The Box Labs", url: "https://www.hackthebox.com" }
        ]
      },
      {
        id: "defense-ops",
        label: "Digital Forensics & Incident Response",
        description: "Establish defense parameters, analyze infected server images, check event logs, and trace bad actors.",
        concepts: ["SIEM (Splunk)", "Log File Analysis", "Malware Sandbox execution", "Incident Response playbooks"],
        docs: "https://docs.splunk.com",
        tutorials: [
          { title: "Blue Team Fundamentals - Security Blue Team", url: "https://securityblue.team" }
        ],
        practice: [
          { title: "Incident Response Labs - CyberDefenders", url: "https://cyberdefenders.org" }
        ]
      }
    ]
  }
};
