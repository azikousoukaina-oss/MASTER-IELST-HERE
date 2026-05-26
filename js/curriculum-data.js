'use strict';

window.SovereignCurriculum = (() => {

  // ─── Phase Definitions ────────────────────────────────────────────────────

  const PHASES = [
    {
      id: 1,
      title: 'Foundations',
      subtitle: 'HTML, CSS & JavaScript Essentials',
      weeks: [1, 26],
      color: '#C9886C',
      icon: '🌱',
      description: 'Build rock-solid fundamentals in HTML semantics, CSS mastery, and JavaScript core concepts.',
      skills: ['HTML5', 'CSS3', 'Flexbox', 'Grid', 'JavaScript ES6+', 'DOM', 'Events', 'Async JS']
    },
    {
      id: 2,
      title: 'Frontend Development',
      subtitle: 'React, State Management & Modern Tooling',
      weeks: [27, 52],
      color: '#B8768A',
      icon: '⚛️',
      description: 'Master React, component patterns, state management, and the modern frontend ecosystem.',
      skills: ['React', 'Hooks', 'Redux', 'Vite', 'TypeScript', 'Testing', 'Performance', 'Accessibility']
    },
    {
      id: 3,
      title: 'Backend Development',
      subtitle: 'Node.js, APIs & Databases',
      weeks: [53, 78],
      color: '#9B7BAE',
      icon: '⚙️',
      description: 'Build production-grade APIs, work with databases, authentication, and server architecture.',
      skills: ['Node.js', 'Express', 'REST APIs', 'PostgreSQL', 'MongoDB', 'Auth/JWT', 'GraphQL', 'Docker']
    },
    {
      id: 4,
      title: 'Full-Stack Mastery',
      subtitle: 'Integration, Deployment & Advanced Patterns',
      weeks: [79, 104],
      color: '#7B9BAE',
      icon: '🚀',
      description: 'Connect frontend and backend, deploy to production, and implement advanced architectural patterns.',
      skills: ['Full-Stack Integration', 'CI/CD', 'AWS/Vercel', 'Redis', 'WebSockets', 'Microservices', 'Security', 'Scaling']
    },
    {
      id: 5,
      title: 'Job Readiness',
      subtitle: 'Portfolio, Interviews & Career Launch',
      weeks: [105, 130],
      color: '#AE9B7B',
      icon: '💼',
      description: 'Build a stunning portfolio, ace technical interviews, and land your first dev role.',
      skills: ['Portfolio', 'GitHub', 'System Design', 'Algorithms', 'Soft Skills', 'Networking', 'Freelancing', 'Career']
    }
  ];

  // ─── Phase 1 — Detailed Week Data (Weeks 1–26) ────────────────────────────

  const PHASE1_WEEKS = [
    // ── WEEK 1 ──────────────────────────────────────────────────────────────
    {
      week: 1, phase: 1,
      title: 'Welcome to the Web',
      subtitle: 'HTML Foundations',
      topics: ['What is the web?', 'How browsers work', 'HTML document structure', 'Essential tags', 'Semantic HTML'],
      days: [
        {
          day: 1, title: 'How the Internet Works',
          content: `# How the Internet Works\n\nWelcome to your coding journey, Soukaina! 🌸\n\nBefore writing a single line of code, let's understand what you're building *for*.\n\n## The Web in Simple Terms\n\nThe internet is essentially a giant network of computers that speak a common language. When you visit a website:\n\n1. Your browser sends a **request** to a server\n2. The server sends back **files** (HTML, CSS, JavaScript)\n3. Your browser **renders** those files into what you see\n\n## Key Concepts\n\n**Client** — Your browser (Chrome, Safari, Firefox)\n**Server** — A computer storing website files\n**HTTP/HTTPS** — The language clients and servers use\n**URL** — The address of a resource\n\n## The Three Languages of the Web\n\n| Language | Role | Analogy |\n|----------|------|----------|\n| **HTML** | Structure | The skeleton |\n| **CSS** | Style | The clothes & makeup |\n| **JavaScript** | Behavior | The muscles & brain |\n\n## Your First Exercise\n\nOpen your browser's DevTools (F12 or right-click → Inspect). Navigate to any website and look at the Elements tab. You're reading raw HTML right now! 🎉`,
          exercise: {
            title: 'Web Exploration',
            description: 'Visit 3 websites you use daily. Open DevTools (F12) on each and explore the Elements panel. Write down 3 HTML tags you see repeated most often.',
            type: 'exploration',
            starter: null
          },
          quiz: [
            { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Transfer Markup Language', 'HyperText Modern Language', 'Home Tool Markup Language'], correct: 0 },
            { q: 'What is the role of CSS in a web page?', options: ['Structure', 'Style', 'Behavior', 'Server communication'], correct: 1 },
            { q: 'What does a browser do with HTML files?', options: ['Stores them', 'Encrypts them', 'Renders them into visual pages', 'Sends them to servers'], correct: 2 }
          ]
        },
        {
          day: 2, title: 'Your First HTML Document',
          content: `# Your First HTML Document\n\nToday you write your very first line of HTML! ✨\n\n## The Essential Structure\n\nEvery HTML page needs this skeleton:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is my first webpage.</p>\n  </body>\n</html>\n\`\`\`\n\n## Breaking It Down\n\n**\`<!DOCTYPE html>\`** — Tells the browser this is HTML5\n**\`<html lang="en">\`** — Root element, sets language\n**\`<head>\`** — Metadata (invisible to users)\n**\`<meta charset="UTF-8">\`** — Supports all characters including Vietnamese!\n**\`<title>\`** — The browser tab title\n**\`<body>\`** — Everything users see\n\n## Tags & Elements\n\nHTML uses **tags** that come in pairs:\n- Opening tag: \`<tagname>\`\n- Closing tag: \`</tagname>\`\n- Together: \`<p>Content here</p>\`\n\nSome tags are **self-closing**: \`<img>\`, \`<br>\`, \`<input>\``,
          exercise: {
            title: 'Build Your First Page',
            description: 'Create an HTML page about yourself. Include: your name as an h1, a paragraph about what you do, your location, and your coding goal.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>About Me</title>\n  </head>\n  <body>\n    <!-- Write your content here -->\n    \n  </body>\n</html>`
          },
          quiz: [
            { q: 'What tag creates the largest heading?', options: ['<h6>', '<h1>', '<heading>', '<title>'], correct: 1 },
            { q: 'Where does page content visible to users go?', options: ['<head>', '<meta>', '<body>', '<html>'], correct: 2 },
            { q: 'What does charset="UTF-8" do?', options: ['Sets font size', 'Supports international characters', 'Defines colors', 'Speeds up loading'], correct: 1 }
          ]
        },
        {
          day: 3, title: 'Text & Headings',
          content: `# Text & Headings\n\nText is the heart of the web. Master how HTML structures it.\n\n## Heading Hierarchy\n\n\`\`\`html\n<h1>Main Title — Only ONE per page</h1>\n<h2>Section Title</h2>\n<h3>Subsection</h3>\n<h4>Sub-subsection</h4>\n<h5>Rarely used</h5>\n<h6>Rarely used</h6>\n\`\`\`\n\n⚠️ **Important:** Use headings for *structure*, not for visual size. CSS controls size.\n\n## Paragraphs & Text Formatting\n\n\`\`\`html\n<p>A paragraph of text.</p>\n\n<strong>Bold / important text</strong>\n<em>Italic / emphasized text</em>\n<mark>Highlighted text</mark>\n<del>Strikethrough text</del>\n<sup>Superscript</sup> and <sub>Subscript</sub>\n\n<!-- Line break (use sparingly) -->\nLine one<br>Line two\n\n<!-- Horizontal rule -->\n<hr>\n\`\`\`\n\n## Semantic vs Visual\n\n| Tag | Meaning | Visual Default |\n|-----|---------|---------------|\n| \`<strong>\` | Important | **Bold** |\n| \`<em>\` | Emphasized | *Italic* |\n| \`<b>\` | Just bold (no meaning) | **Bold** |\n| \`<i>\` | Just italic (no meaning) | *Italic* |`,
          exercise: {
            title: 'IELTS Page',
            description: 'Create a page about IELTS with: a main title (h1), 3 band score sections (h2 each), descriptions using <p>, and important terms in <strong>.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>IELTS Guide</title>\n</head>\n<body>\n  <!-- Create your IELTS page here -->\n  \n</body>\n</html>`
          },
          quiz: [
            { q: 'How many <h1> tags should a page ideally have?', options: ['As many as needed', 'Two', 'One', 'None'], correct: 2 },
            { q: 'Which tag marks text as important (semantic)?', options: ['<b>', '<bold>', '<strong>', '<em>'], correct: 2 },
            { q: 'What does <em> indicate?', options: ['Email', 'Emphasis', 'Error', 'Element'], correct: 1 }
          ]
        },
        {
          day: 4, title: 'Links & Images',
          content: `# Links & Images\n\nThe web is made of links and visuals. Learn to use them correctly.\n\n## Hyperlinks\n\n\`\`\`html\n<!-- External link -->\n<a href="https://www.google.com">Visit Google</a>\n\n<!-- Open in new tab -->\n<a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Google (new tab)</a>\n\n<!-- Internal link (same site) -->\n<a href="/about.html">About Page</a>\n\n<!-- Link to section on same page -->\n<a href="#section-2">Jump to Section 2</a>\n\n<!-- Email link -->\n<a href="mailto:soukaina@example.com">Email Me</a>\n\`\`\`\n\n## Images\n\n\`\`\`html\n<!-- Basic image -->\n<img src="profile.jpg" alt="Soukaina smiling">\n\n<!-- With width and height (good practice) -->\n<img src="photo.jpg" alt="Beautiful Vietnam landscape" width="800" height="600">\n\n<!-- Image from URL -->\n<img src="https://picsum.photos/400/300" alt="Random photo">\n\`\`\`\n\n## The alt Attribute\n\nThe \`alt\` attribute is crucial for:\n- **Accessibility** — screen readers for visually impaired users\n- **SEO** — search engines understand your images\n- **Fallback** — shown when image fails to load\n\n✅ Good: \`alt="Teacher writing on whiteboard"\`\n❌ Bad: \`alt="image1"\` or empty \`alt=""\` (unless purely decorative)`,
          exercise: {
            title: 'Link & Image Gallery',
            description: 'Create a page with: 3 links (one external, one internal anchor, one email), a profile image with proper alt text, and a gallery of 4 images using placeholder URLs.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Gallery</title>\n</head>\n<body>\n  <h1>My Links & Gallery</h1>\n  \n  <!-- Add your links here -->\n  \n  <!-- Add your images here -->\n  \n</body>\n</html>`
          },
          quiz: [
            { q: 'What does the "alt" attribute do?', options: ['Changes image size', 'Describes the image for accessibility', 'Links to image source', 'Sets image quality'], correct: 1 },
            { q: 'How do you open a link in a new tab?', options: ['target="new"', 'open="tab"', 'target="_blank"', 'href="_blank"'], correct: 2 },
            { q: 'Why add rel="noopener noreferrer" to external links?', options: ['Looks cleaner', 'Security — prevents the new page from accessing your page', 'Speeds up loading', 'Required by browsers'], correct: 1 }
          ]
        },
        {
          day: 5, title: 'Lists & Tables',
          content: `# Lists & Tables\n\nOrganize information clearly with lists and tables.\n\n## Unordered Lists (bullet points)\n\n\`\`\`html\n<ul>\n  <li>Coffee</li>\n  <li>Green tea</li>\n  <li>Water</li>\n</ul>\n\`\`\`\n\n## Ordered Lists (numbered)\n\n\`\`\`html\n<ol>\n  <li>Wake up</li>\n  <li>Morning skincare</li>\n  <li>Breakfast</li>\n</ol>\n\`\`\`\n\n## Description Lists\n\n\`\`\`html\n<dl>\n  <dt>IELTS</dt>\n  <dd>International English Language Testing System</dd>\n  <dt>Band 9</dt>\n  <dd>Expert user — near perfect English</dd>\n</dl>\n\`\`\`\n\n## Tables\n\n\`\`\`html\n<table>\n  <thead>\n    <tr>\n      <th>Band Score</th>\n      <th>Skill Level</th>\n      <th>Description</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>9</td>\n      <td>Expert</td>\n      <td>Full operational command</td>\n    </tr>\n    <tr>\n      <td>7</td>\n      <td>Good</td>\n      <td>Occasional inaccuracies</td>\n    </tr>\n  </tbody>\n</table>\n\`\`\`\n\n⚠️ Tables are for **tabular data**, not for page layout. CSS Grid and Flexbox handle layout.`,
          exercise: {
            title: 'IELTS Study Planner',
            description: 'Build a study planner page with: an unordered list of IELTS skills to study, a numbered daily schedule, and a table showing band scores with descriptions.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>IELTS Study Planner</title>\n</head>\n<body>\n  <h1>My IELTS Study Planner</h1>\n  \n  <!-- Skills list -->\n  \n  <!-- Daily schedule -->\n  \n  <!-- Band scores table -->\n  \n</body>\n</html>`
          },
          quiz: [
            { q: 'Which tag creates a table header cell?', options: ['<td>', '<th>', '<thead>', '<header>'], correct: 1 },
            { q: 'What is <dl> used for?', options: ['Download list', 'Description/definition lists', 'Dynamic list', 'Document list'], correct: 1 },
            { q: 'What should tables NOT be used for?', options: ['Financial data', 'Comparison charts', 'Page layout', 'Sports scores'], correct: 2 }
          ]
        }
      ],
      weeklyTest: {
        title: 'Week 1 Assessment: HTML Foundations',
        questions: [
          { q: 'What does semantic HTML mean?', options: ['HTML with colors', 'Using tags that convey meaning about their content', 'Using the latest HTML version', 'Minimizing code'], correct: 1 },
          { q: 'Which is the correct HTML structure order?', options: ['<html><body><head>', '<html><head><body>', '<head><html><body>', '<body><head><html>'], correct: 1 },
          { q: 'What makes a self-closing tag different?', options: ['Has no closing tag', 'Is written in uppercase', 'Contains only numbers', 'Must have alt attribute'], correct: 0 },
          { q: 'Best practice: how many h1 per page?', options: ['Unlimited', 'Two maximum', 'One', 'Depends on content length'], correct: 2 },
          { q: 'What does <strong> communicate vs <b>?', options: ['No difference', '<strong> means important; <b> is just visual', '<b> is for headings', '<strong> is deprecated'], correct: 1 }
        ],
        passingScore: 70
      }
    },

    // ── WEEK 2 ──────────────────────────────────────────────────────────────
    {
      week: 2, phase: 1,
      title: 'Semantic HTML & Forms',
      subtitle: 'Meaningful Structure & User Input',
      topics: ['Semantic elements', 'Forms & inputs', 'Accessibility basics', 'HTML5 APIs'],
      days: [
        {
          day: 1, title: 'Semantic HTML5 Elements',
          content: `# Semantic HTML5 Elements\n\nHTML5 gave us purpose-built tags that make pages meaningful.\n\n## Page Structure Tags\n\n\`\`\`html\n<header>    <!-- Site header, logo, nav -->\n<nav>       <!-- Navigation links -->\n<main>      <!-- Primary content (one per page) -->\n<article>   <!-- Self-contained content (blog post, news) -->\n<section>   <!-- Thematic grouping of content -->\n<aside>     <!-- Sidebar, related content -->\n<footer>    <!-- Site footer -->\n\`\`\`\n\n## A Real Page Layout\n\n\`\`\`html\n<header>\n  <h1>Soukaina's English Academy</h1>\n  <nav>\n    <ul>\n      <li><a href="/">Home</a></li>\n      <li><a href="/courses">Courses</a></li>\n      <li><a href="/contact">Contact</a></li>\n    </ul>\n  </nav>\n</header>\n\n<main>\n  <article>\n    <h2>IELTS Writing Tips</h2>\n    <p>Today we cover Task 2 strategies...</p>\n  </article>\n  <aside>\n    <h3>Related Resources</h3>\n  </aside>\n</main>\n\n<footer>\n  <p>© 2026 Soukaina's Academy</p>\n</footer>\n\`\`\`\n\n## Why Semantics Matter\n\n- **SEO**: Google understands your content better\n- **Accessibility**: Screen readers navigate by landmarks\n- **Maintainability**: Developers understand code faster\n- **Consistency**: Predictable structure across sites`,
          exercise: {
            title: 'IELTS Academy Homepage',
            description: 'Build a semantic homepage for "Soukaina\'s IELTS Academy" using proper header, nav, main, article, aside, and footer elements.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Soukaina's IELTS Academy</title>\n</head>\n<body>\n  <!-- Structure this page semantically -->\n  \n</body>\n</html>`
          },
          quiz: [
            { q: 'How many <main> elements should a page have?', options: ['Unlimited', 'Two', 'One', 'One per section'], correct: 2 },
            { q: 'What is <article> best used for?', options: ['Any content', 'Self-contained content that makes sense alone', 'Article text formatting', 'Main navigation'], correct: 1 },
            { q: 'What does <aside> typically contain?', options: ['Main content', 'Navigation', 'Related but non-essential content (sidebar)', 'Footer information'], correct: 2 }
          ]
        },
        {
          day: 2, title: 'HTML Forms',
          content: `# HTML Forms\n\nForms let users interact with your app. Every login, search, and signup uses them.\n\n## Basic Form Structure\n\n\`\`\`html\n<form action="/submit" method="POST">\n  <label for="name">Full Name</label>\n  <input type="text" id="name" name="name" placeholder="Enter your name" required>\n  \n  <label for="email">Email</label>\n  <input type="email" id="email" name="email" required>\n  \n  <button type="submit">Submit</button>\n</form>\n\`\`\`\n\n## Input Types\n\n\`\`\`html\n<input type="text">       <!-- Single-line text -->\n<input type="email">      <!-- Email (validates @ symbol) -->\n<input type="password">   <!-- Hidden characters -->\n<input type="number">     <!-- Numeric -->\n<input type="tel">        <!-- Phone number -->\n<input type="date">       <!-- Date picker -->\n<input type="range">      <!-- Slider -->\n<input type="checkbox">   <!-- Toggle -->\n<input type="radio">      <!-- One of many -->\n<input type="file">       <!-- File upload -->\n<input type="hidden">     <!-- Data not shown -->\n\`\`\`\n\n## Textarea & Select\n\n\`\`\`html\n<textarea name="bio" rows="4" placeholder="Tell us about yourself..."></textarea>\n\n<select name="level">\n  <option value="">-- Select Band Score --</option>\n  <option value="5">Band 5</option>\n  <option value="6">Band 6</option>\n  <option value="7">Band 7</option>\n</select>\n\`\`\`\n\n## Critical: Label + Input Connection\n\n\`\`\`html\n<!-- Method 1: for + id (recommended) -->\n<label for="username">Username</label>\n<input type="text" id="username" name="username">\n\n<!-- Method 2: wrapping -->\n<label>\n  Password\n  <input type="password" name="password">\n</label>\n\`\`\``,
          exercise: {
            title: 'Student Registration Form',
            description: 'Build a complete IELTS student registration form with: name, email, country, phone, target band score (select), learning goal (textarea), and submit button.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Student Registration</title>\n</head>\n<body>\n  <h1>Register for IELTS Classes</h1>\n  <form>\n    <!-- Build your form here -->\n    \n  </form>\n</body>\n</html>`
          },
          quiz: [
            { q: 'Why should labels be connected to inputs?', options: ['Visual styling', 'Accessibility — clicking label focuses the input', 'Required by browsers', 'Makes form smaller'], correct: 1 },
            { q: 'What input type validates email format?', options: ['type="mail"', 'type="text"', 'type="email"', 'type="address"'], correct: 2 },
            { q: 'What attribute makes an input required?', options: ['mandatory', 'required', 'validate', 'mustfill'], correct: 1 }
          ]
        },
        {
          day: 3, title: 'Form Validation & Accessibility',
          content: `# Form Validation & Accessibility\n\nGood forms guide users to success. Accessible forms serve everyone.\n\n## Built-in HTML5 Validation\n\n\`\`\`html\n<!-- Required field -->\n<input type="text" required>\n\n<!-- Minimum length -->\n<input type="password" minlength="8">\n\n<!-- Pattern (regex) -->\n<input type="text" pattern="[A-Za-z]{3,}" title="At least 3 letters">\n\n<!-- Number range -->\n<input type="number" min="1" max="9" step="0.5">\n\n<!-- Custom validation message -->\n<input type="email" oninvalid="this.setCustomValidity('Please enter a valid email!')" oninput="this.setCustomValidity('')">\n\`\`\`\n\n## Fieldset & Legend\n\n\`\`\`html\n<fieldset>\n  <legend>IELTS Goals</legend>\n  <label><input type="radio" name="goal" value="study"> Study Abroad</label>\n  <label><input type="radio" name="goal" value="work"> Work Visa</label>\n  <label><input type="radio" name="goal" value="immigration"> Immigration</label>\n</fieldset>\n\`\`\`\n\n## ARIA for Accessibility\n\n\`\`\`html\n<!-- Role description -->\n<input type="text" aria-label="Search courses">\n\n<!-- Link description -->\n<input type="text" aria-describedby="hint">\n<p id="hint">Enter your full name as on your passport</p>\n\n<!-- Error message -->\n<input type="email" aria-invalid="true" aria-describedby="email-error">\n<span id="email-error">Please enter a valid email address</span>\n\`\`\``,
          exercise: {
            title: 'Validated IELTS Test Booking',
            description: 'Create a test booking form with: validated email, phone (pattern), date (min=today), test type (radio buttons in fieldset), notes (textarea), and proper ARIA labels.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Book IELTS Test</title></head>\n<body>\n  <h1>Book Your IELTS Test</h1>\n  <form novalidate>\n    <!-- Build validated form -->\n  </form>\n</body>\n</html>`
          },
          quiz: [
            { q: 'What does aria-label do?', options: ['Styles the element', 'Provides accessible name for screen readers', 'Validates input', 'Adds placeholder text'], correct: 1 },
            { q: 'What HTML element groups related form fields?', options: ['<group>', '<fieldset>', '<section>', '<div>'], correct: 1 },
            { q: 'The "required" attribute does what?', options: ['Styles field as red', 'Prevents form submission if empty', 'Adds placeholder', 'Makes field read-only'], correct: 1 }
          ]
        },
        {
          day: 4, title: 'Media & Embedding',
          content: `# Media & Embedding\n\nModern web apps are rich with video, audio, and embedded content.\n\n## Video\n\n\`\`\`html\n<video controls width="640" height="360">\n  <source src="lesson.mp4" type="video/mp4">\n  <source src="lesson.webm" type="video/webm">\n  Your browser doesn't support video. <a href="lesson.mp4">Download</a>\n</video>\n\n<!-- Autoplay (muted required for autoplay) -->\n<video autoplay muted loop playsinline>\n  <source src="background.mp4" type="video/mp4">\n</video>\n\`\`\`\n\n## Audio\n\n\`\`\`html\n<audio controls>\n  <source src="listening-practice.mp3" type="audio/mpeg">\n  <source src="listening-practice.ogg" type="audio/ogg">\n</audio>\n\`\`\`\n\n## YouTube Embed\n\n\`\`\`html\n<iframe \n  width="560" height="315"\n  src="https://www.youtube.com/embed/VIDEOID"\n  title="IELTS Listening Practice"\n  frameborder="0"\n  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"\n  allowfullscreen>\n</iframe>\n\`\`\`\n\n## Figure & Figcaption\n\n\`\`\`html\n<figure>\n  <img src="ielts-chart.png" alt="IELTS score distribution chart">\n  <figcaption>Figure 1: IELTS score distribution 2025</figcaption>\n</figure>\n\`\`\``,
          exercise: {
            title: 'IELTS Listening Practice Page',
            description: 'Build a listening practice page with: an audio player, a figure with IELTS chart image and caption, and a YouTube embed of an IELTS tutorial.',
            type: 'code',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>IELTS Listening</title></head>\n<body>\n  <h1>IELTS Listening Practice</h1>\n  <!-- Add your media elements -->\n</body>\n</html>`
          },
          quiz: [
            { q: 'Why provide multiple <source> elements for video?', options: ['Better quality', 'Browser compatibility — different browsers support different formats', 'Required by HTML5', 'Faster loading'], correct: 1 },
            { q: 'What does <figcaption> describe?', options: ['The whole page', 'The parent <figure> element', 'Any image', 'A table'], correct: 1 },
            { q: 'Why must autoplay video be muted?', options: ['Better performance', 'Browser policy — prevents unwanted audio', 'Saves bandwidth', 'HTML requirement'], correct: 1 }
          ]
        },
        {
          day: 5, title: 'Week 2 Practice Project',
          content: `# Week 2 Project: IELTS Academy Page\n\nPut everything together in a real project!\n\n## Your Mission\n\nBuild a complete, semantic IELTS Academy landing page with:\n\n1. **Header** with logo (text) and navigation (Home, Courses, About, Contact)\n2. **Hero section** with heading, subtitle, and a call-to-action button\n3. **Features section** with 3 benefits as an unordered list\n4. **Band Scores table** showing bands 5–9 with descriptions\n5. **Contact form** with: name, email, phone, target band, message textarea\n6. **Footer** with copyright\n\n## Requirements\n- Use semantic HTML5 throughout\n- All images have alt text\n- Form has proper labels connected to inputs\n- Form has basic validation (required, email type)\n- Table has proper thead/tbody/th structure\n\n## Bonus Challenges\n- Add a video or audio element for a sample lesson\n- Use <fieldset> for the goal selection\n- Add ARIA attributes to improve accessibility`,
          exercise: {
            title: 'IELTS Academy Full Page',
            description: 'Build the complete IELTS Academy landing page as described above. This is your Week 2 milestone project.',
            type: 'project',
            starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Soukaina's IELTS Academy</title>\n</head>\n<body>\n  <!-- Your complete academy page -->\n  \n</body>\n</html>`
          },
          quiz: []
        }
      ],
      weeklyTest: {
        title: 'Week 2 Assessment: Semantic HTML & Forms',
        questions: [
          { q: 'Which element should wrap the primary unique content of a page?', options: ['<div>', '<section>', '<main>', '<article>'], correct: 2 },
          { q: 'Difference between <section> and <article>?', options: ['No difference', '<article> is standalone meaningful content; <section> groups related content', '<section> is for navigation', '<article> is only for blog posts'], correct: 1 },
          { q: 'What does the "for" attribute on a label reference?', options: ['The form\'s name attribute', 'The input\'s id attribute', 'The input\'s type', 'The form\'s action'], correct: 1 },
          { q: 'What is ARIA used for?', options: ['Styling', 'Animations', 'Accessibility for assistive technologies', 'Form validation'], correct: 2 },
          { q: 'Why avoid using tables for layout?', options: ['Tables are slow', 'Semantic mismatch — tables are for data, not visual arrangement', 'Tables can\'t be styled', 'Modern browsers don\'t support table layouts'], correct: 1 }
        ],
        passingScore: 70
      }
    },

    // ── WEEK 3 ──────────────────────────────────────────────────────────────
    {
      week: 3, phase: 1,
      title: 'CSS Fundamentals',
      subtitle: 'Selectors, Box Model & Typography',
      topics: ['CSS syntax', 'Selectors', 'Box model', 'Typography', 'Colors & units'],
      days: [
        {
          day: 1, title: 'CSS Syntax & Selectors',
          content: `# CSS Syntax & Selectors\n\nCSS is the magic that transforms plain HTML into beautiful designs.\n\n## CSS Syntax\n\n\`\`\`css\nselector {\n  property: value;\n  another-property: another-value;\n}\n\`\`\`\n\n## Three Ways to Add CSS\n\n\`\`\`html\n<!-- 1. External (best practice) -->\n<link rel="stylesheet" href="styles.css">\n\n<!-- 2. Internal (for specific pages) -->\n<style>\n  h1 { color: hotpink; }\n</style>\n\n<!-- 3. Inline (avoid except for dynamic values) -->\n<h1 style="color: hotpink;">Hello</h1>\n\`\`\`\n\n## Selectors\n\n\`\`\`css\n/* Element selector */\nh1 { color: #C9886C; }\n\n/* Class selector */\n.card { background: white; }\n\n/* ID selector (use sparingly) */\n#hero { height: 100vh; }\n\n/* Descendant selector */\n.nav a { text-decoration: none; }\n\n/* Child selector (direct only) */\n.nav > ul { list-style: none; }\n\n/* Sibling selectors */\nh1 + p { font-size: 1.2rem; }  /* adjacent sibling */\nh1 ~ p { color: gray; }        /* general sibling */\n\n/* Pseudo-classes */\na:hover { color: rose; }\ninput:focus { outline: 2px solid #C9886C; }\nli:first-child { font-weight: bold; }\nli:nth-child(2n) { background: #f9f9f9; }\n\n/* Pseudo-elements */\np::first-line { font-variant: small-caps; }\nli::before { content: "✓ "; color: green; }\n\n/* Attribute selectors */\ninput[type="email"] { border-color: blue; }\na[href^="https"] { /* starts with */ }\na[href$=".pdf"] { /* ends with */ }\n\`\`\``,
          exercise: {
            title: 'Style the IELTS Page',
            description: 'Link a CSS file to your Week 1 IELTS page. Style: h1 in rose gold, paragraphs with a comfortable line-height, links with custom hover colors, and nth-child row coloring on your table.',
            type: 'code',
            starter: `/* styles.css */\n\n/* Style h1 */\n\n/* Style paragraphs */\n\n/* Style links */\na { }\na:hover { }\n\n/* Alternating table rows */\ntr:nth-child(even) { }`
          },
          quiz: [
            { q: 'Which selector has highest specificity?', options: ['.class', '#id', 'element', 'element.class'], correct: 1 },
            { q: 'What does the > combinator select?', options: ['All descendants', 'Direct children only', 'Adjacent siblings', 'All siblings'], correct: 1 },
            { q: 'What does ::before create?', options: ['A new element before the tag in HTML', 'A pseudo-element before the content', 'The first child element', 'A CSS variable'], correct: 1 }
          ]
        },
        {
          day: 2, title: 'The Box Model',
          content: `# The Box Model\n\nEvery HTML element is a box. Understanding the box model is fundamental to CSS layout.\n\n## The Four Layers\n\n\`\`\`\n┌─────────────────────────────────┐\n│           MARGIN                │  (transparent space outside)\n│  ┌───────────────────────────┐  │\n│  │         BORDER            │  │  (visible edge)\n│  │  ┌─────────────────────┐  │  │\n│  │  │       PADDING       │  │  │  (space inside border)\n│  │  │  ┌───────────────┐  │  │  │\n│  │  │  │    CONTENT    │  │  │  │  (text, images)\n│  │  │  └───────────────┘  │  │  │\n│  │  └─────────────────────┘  │  │\n│  └───────────────────────────┘  │\n└─────────────────────────────────┘\n\`\`\`\n\n## Setting Box Properties\n\n\`\`\`css\n.card {\n  /* Shorthand: top right bottom left */\n  margin: 16px 24px 16px 24px;\n  margin: 16px 24px;  /* top/bottom left/right */\n  margin: 16px;       /* all sides */\n  margin-top: 8px;    /* individual side */\n  \n  padding: 20px;\n  \n  border: 2px solid #C9886C;\n  border-radius: 12px;\n  \n  width: 300px;\n  height: 200px;\n}\n\`\`\`\n\n## box-sizing: border-box (USE THIS ALWAYS!)\n\n\`\`\`css\n/* Default: width = content only (confusing!) */\n/* box-sizing: content-box */\n\n/* Better: width includes padding + border */\n* {\n  box-sizing: border-box;\n}\n\n/* Example: */\n.box {\n  box-sizing: border-box;\n  width: 200px;    /* Total = 200px (padding included) */\n  padding: 20px;   /* Content = 160px */\n}\n\`\`\``,
          exercise: {
            title: 'Card Component',
            description: 'Create a styled course card with: image, title, description, price, and enroll button. Apply border-box sizing, proper padding/margin, border-radius, and hover shadow effects.',
            type: 'code',
            starter: `/* Reset */\n* { box-sizing: border-box; margin: 0; padding: 0; }\n\nbody { font-family: sans-serif; padding: 24px; }\n\n.card {\n  /* Add your box model styles */\n}`
          },
          quiz: [
            { q: 'What does box-sizing: border-box change?', options: ['Border style', 'Makes width include padding and border', 'Removes margin', 'Changes border color'], correct: 1 },
            { q: 'What is the order for margin shorthand "margin: 10px 20px 30px 40px"?', options: ['Left/right/top/bottom', 'Top/right/bottom/left', 'Top/bottom/left/right', 'All equal'], correct: 1 },
            { q: 'What does margin: auto do on block elements?', options: ['Removes all margin', 'Centers the element horizontally', 'Adds equal margin all sides', 'Only works on inline elements'], correct: 1 }
          ]
        },
        {
          day: 3, title: 'Typography & Colors',
          content: `# Typography & Colors\n\nBeautiful type and color choices define your brand.\n\n## Typography Properties\n\n\`\`\`css\nbody {\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  font-size: 16px;      /* Base size */\n  line-height: 1.6;     /* 1.5–1.8 is readable */\n  font-weight: 400;     /* 100–900 */\n  font-style: italic;\n  letter-spacing: 0.02em;\n  text-transform: uppercase; /* lowercase | capitalize */\n  text-decoration: none;\n  text-align: center; /* left | right | justify */\n}\n\nh1 {\n  font-size: clamp(2rem, 5vw, 4rem); /* responsive font sizing */\n}\n\`\`\`\n\n## Google Fonts\n\n\`\`\`html\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n\`\`\`\n\n## CSS Colors\n\n\`\`\`css\n/* Named colors */\ncolor: rose;\n\n/* Hex */\ncolor: #C9886C;\ncolor: #C9886C80; /* with alpha */\n\n/* RGB */\ncolor: rgb(201, 136, 108);\ncolor: rgba(201, 136, 108, 0.5);\n\n/* HSL (best for design systems!) */\ncolor: hsl(20, 45%, 61%);\ncolor: hsla(20, 45%, 61%, 0.7);\n\n/* Modern: CSS color level 4 */\ncolor: oklch(65% 0.15 30);\n\`\`\`\n\n## CSS Custom Properties (Variables)\n\n\`\`\`css\n:root {\n  --color-primary: #C9886C;\n  --color-text: #2D1B14;\n  --font-heading: 'Playfair Display', serif;\n  --radius: 12px;\n}\n\n.button {\n  background: var(--color-primary);\n  border-radius: var(--radius);\n}\n\`\`\``,
          exercise: {
            title: 'Design System Starter',
            description: 'Create a CSS file with: custom properties for a color palette (primary, secondary, text, background), Google Fonts setup, and style an h1, h2, p, and a using your variables.',
            type: 'code',
            starter: `:root {\n  --color-primary: /* your choice */;\n  --color-secondary: /* your choice */;\n  --font-body: /* your choice */;\n  --font-heading: /* your choice */;\n}\n\n/* Style your elements */`
          },
          quiz: [
            { q: 'What CSS unit is relative to the root font size?', options: ['em', 'rem', 'px', 'vh'], correct: 1 },
            { q: 'What does line-height: 1.6 mean?', options: ['16px line height', '160% of font size', '1.6 pixels', '1.6 times the element width'], correct: 1 },
            { q: 'Why use CSS custom properties (variables)?', options: ['Required for animations', 'Centralizes values for consistency and easy theme changes', 'Only way to use colors', 'Makes CSS faster'], correct: 1 }
          ]
        },
        {
          day: 4, title: 'Display & Positioning',
          content: `# Display & Positioning\n\nControl how elements flow and where they appear on the page.\n\n## Display Values\n\n\`\`\`css\n/* Block: full width, starts new line */\ndiv, p, h1, section { display: block; }\n\n/* Inline: flows with text, can't set width/height */\nspan, a, strong { display: inline; }\n\n/* Inline-block: flows with text BUT accepts width/height */\n.badge { display: inline-block; width: 24px; height: 24px; }\n\n/* None: removed from layout entirely */\n.hidden { display: none; }\n\n/* Flex: powerful 1D layout */\n.row { display: flex; }\n\n/* Grid: powerful 2D layout */\n.page { display: grid; }\n\`\`\`\n\n## Positioning\n\n\`\`\`css\n/* static: default, normal flow */\n.default { position: static; }\n\n/* relative: offset from normal position */\n.nudge { position: relative; top: 10px; left: 5px; }\n\n/* absolute: removed from flow, positioned to nearest relative parent */\n.badge {\n  position: absolute;\n  top: 0; right: 0;\n}\n\n/* fixed: relative to viewport (stays on scroll) */\n.navbar { position: fixed; top: 0; width: 100%; }\n\n/* sticky: normal flow until scrolled to threshold */\n.sidebar { position: sticky; top: 80px; }\n\`\`\`\n\n## Z-Index (stacking order)\n\n\`\`\`css\n.modal { position: fixed; z-index: 1000; }\n.overlay { position: fixed; z-index: 999; }\n.navbar { position: fixed; z-index: 100; }\n\`\`\``,
          exercise: {
            title: 'Sticky Navigation + Card Badge',
            description: 'Build: a fixed navigation bar (stays on scroll), a card with a "NEW" badge using absolute positioning, and a sticky sidebar.',
            type: 'code',
            starter: `* { box-sizing: border-box; margin: 0; }\n\n/* Sticky nav */\n.navbar {\n  position: ;\n  /* complete this */\n}\n\n/* Card with badge */\n.card { position: relative; }\n.card-badge {\n  position: ;\n  /* complete this */\n}`
          },
          quiz: [
            { q: 'What does position: absolute remove elements from?', options: ['The DOM', 'Normal document flow', 'The viewport', 'All parent elements'], correct: 1 },
            { q: 'What positioning context does absolute use?', options: ['The viewport', 'The body', 'The nearest positioned ancestor', 'The root element'], correct: 2 },
            { q: 'What makes position: sticky unique?', options: ['Always stays visible', 'Behaves like relative until threshold, then fixed', 'Only works on nav elements', 'Same as fixed positioning'], correct: 1 }
          ]
        },
        {
          day: 5, title: 'CSS Practice Project',
          content: `# Week 3 Project: Styled IELTS Landing Page\n\nApply all CSS fundamentals to your HTML from Week 2.\n\n## Styling Goals\n\n1. **Typography system** — Playfair Display for headings, Inter for body, clear hierarchy\n2. **Color palette** — CSS custom properties for a cohesive palette\n3. **Box model mastery** — cards with proper padding, margin, border-radius\n4. **Navigation** — fixed top nav with hover states\n5. **Hero section** — large heading, background color or gradient\n6. **Feature cards** — three cards in a row using inline-block\n7. **Table** — styled with nth-child striping\n8. **Form** — styled inputs with focus states\n9. **Responsive basics** — readable on mobile (we'll do full responsive next week)\n\n## Design Inspiration\n\nUse this palette:\n- Primary: #C9886C (rose gold)\n- Secondary: #B8768A (mauve)\n- Dark: #2D1B14 (deep brown)\n- Light: #FDF6F0 (ivory)\n- Text: #4A3728`,
          exercise: {
            title: 'Complete Styled Page',
            description: 'Style your Week 2 IELTS Academy HTML page with all the CSS concepts from this week. Make it look professional and beautiful.',
            type: 'project',
            starter: `/* ===================================\n   IELTS Academy Stylesheet\n   =================================== */\n\n/* 1. Custom Properties */\n:root {\n  \n}\n\n/* 2. Reset & Base */\n* { box-sizing: border-box; }\n\n/* 3. Typography */\n\n/* 4. Navigation */\n\n/* 5. Hero */\n\n/* 6. Cards */\n\n/* 7. Table */\n\n/* 8. Form */\n\n/* 9. Footer */`
          },
          quiz: []
        }
      ],
      weeklyTest: {
        title: 'Week 3 Assessment: CSS Fundamentals',
        questions: [
          { q: 'What is CSS specificity?', options: ['How fast CSS loads', 'A ranking that determines which styles apply when rules conflict', 'The number of properties in a rule', 'How specific the color value is'], correct: 1 },
          { q: 'What does the universal selector * select?', options: ['Only block elements', 'All elements', 'Only the body', 'Only visible elements'], correct: 1 },
          { q: 'When does position: sticky "stick"?', options: ['Always', 'When the element reaches the top threshold on scroll', 'On mobile only', 'When JavaScript triggers it'], correct: 1 },
          { q: 'What is the cascade in CSS?', options: ['An animation type', 'The algorithm determining which rule wins when multiple match', 'A type of selector', 'Cascading = inheriting from parent'], correct: 1 },
          { q: 'Why is box-sizing: border-box recommended?', options: ['Better performance', 'More intuitive: set width = the actual total visible width', 'Required in CSS3', 'Removes need for margins'], correct: 1 }
        ],
        passingScore: 70
      }
    }
  ];

  // ─── Phase 2–5 — Summary Structure ────────────────────────────────────────

  function _buildSummaryWeeks(start, end, phase, titles) {
    const weeks = [];
    for (let w = start; w <= end; w++) {
      const i = w - start;
      weeks.push({
        week: w, phase,
        title: titles[i] || `Week ${w}`,
        subtitle: 'Coming soon — AI will generate this lesson',
        topics: [],
        days: [],
        weeklyTest: null
      });
    }
    return weeks;
  }

  const PHASE2_TITLES = [
    'React Fundamentals', 'JSX & Components', 'Props & State', 'Hooks: useState & useEffect',
    'Event Handling', 'Lists, Keys & Conditionals', 'Forms in React', 'Component Patterns',
    'useContext & Global State', 'useReducer', 'Custom Hooks', 'React Router',
    'Data Fetching', 'Error Boundaries', 'Performance Optimization', 'useMemo & useCallback',
    'Testing with Vitest', 'React Testing Library', 'TypeScript Basics', 'TypeScript with React',
    'Tailwind CSS', 'Animation with Framer Motion', 'State Management: Zustand', 'Vite & Build Tools',
    'Deployment: Vercel & Netlify', 'Phase 2 Capstone Project'
  ];

  const PHASE3_TITLES = [
    'Node.js Fundamentals', 'npm & Modules', 'Express.js Basics', 'Routing & Middleware',
    'REST API Design', 'HTTP Methods & Status Codes', 'Request & Response', 'Authentication: Sessions',
    'Authentication: JWT', 'bcrypt & Password Security', 'PostgreSQL Introduction', 'SQL Queries',
    'Joins & Relationships', 'ORM: Prisma', 'MongoDB Introduction', 'Mongoose ODM',
    'File Uploads', 'Email with Nodemailer', 'GraphQL Introduction', 'Apollo Server',
    'WebSockets & Socket.io', 'Redis & Caching', 'Docker Basics', 'API Testing with Postman',
    'Rate Limiting & Security', 'Phase 3 Capstone Project'
  ];

  const PHASE4_TITLES = [
    'Full-Stack Project Setup', 'Next.js Introduction', 'Next.js Routing', 'Server Components',
    'API Routes in Next.js', 'Database Integration', 'Authentication in Next.js', 'Next.js Deployment',
    'CI/CD with GitHub Actions', 'AWS EC2 & S3 Basics', 'Environment Variables & Secrets', 'Monitoring & Logging',
    'Performance: Core Web Vitals', 'SEO & Meta Tags', 'Internationalization (i18n)', 'Progressive Web Apps',
    'Microservices Introduction', 'Message Queues', 'Serverless Functions', 'Edge Computing',
    'Web Security: OWASP Top 10', 'Rate Limiting & DDoS Protection', 'GDPR & Privacy', 'Scaling Strategies',
    'System Design Basics', 'Phase 4 Capstone Project'
  ];

  const PHASE5_TITLES = [
    'Portfolio Strategy', 'GitHub Profile Optimization', 'README & Documentation', 'Deploying Portfolio',
    'Resume Writing for Developers', 'LinkedIn for Tech', 'Networking in Tech', 'Cold Outreach',
    'Technical Interview Prep', 'Data Structures Review', 'Algorithms: Sorting & Searching', 'Big O Notation',
    'System Design Interview', 'Behavioral Interview', 'Live Coding Practice', 'Take-Home Project Strategy',
    'Freelancing Platforms', 'First Client Project', 'Pricing Your Work', 'Contracts & Invoicing',
    'Remote Work Best Practices', 'Time Management as a Developer', 'Imposter Syndrome & Growth Mindset',
    'Open Source Contribution', 'Staying Current in Tech', 'Career Launch & Celebration 🎉'
  ];

  const PHASE2_WEEKS = _buildSummaryWeeks(27, 52, 2, PHASE2_TITLES);
  const PHASE3_WEEKS = _buildSummaryWeeks(53, 78, 3, PHASE3_TITLES);
  const PHASE4_WEEKS = _buildSummaryWeeks(79, 104, 4, PHASE4_TITLES);
  const PHASE5_WEEKS = _buildSummaryWeeks(105, 130, 5, PHASE5_TITLES);

  // ─── Combined Weeks Array ────────────────────────────────────────────────

  const ALL_WEEKS = [
    ...PHASE1_WEEKS,
    ...PHASE2_WEEKS,
    ...PHASE3_WEEKS,
    ...PHASE4_WEEKS,
    ...PHASE5_WEEKS
  ];

  // ─── Public API ──────────────────────────────────────────────────────────

  function getPhases() {
    return PHASES;
  }

  function getPhase(phaseId) {
    return PHASES.find(p => p.id === phaseId) || null;
  }

  function getWeek(weekNum) {
    return ALL_WEEKS.find(w => w.week === weekNum) || null;
  }

  function getWeeksForPhase(phaseId) {
    const phase = PHASES.find(p => p.id === phaseId);
    if (!phase) return [];
    const [start, end] = phase.weeks;
    return ALL_WEEKS.filter(w => w.week >= start && w.week <= end);
  }

  function getDay(weekNum, dayNum) {
    const week = getWeek(weekNum);
    if (!week || !week.days) return null;
    return week.days.find(d => d.day === dayNum) || null;
  }

  function getCurrentWeek() {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    return progress.currentWeek || 1;
  }

  function getCurrentPhase() {
    const week = getCurrentWeek();
    return PHASES.find(p => week >= p.weeks[0] && week <= p.weeks[1]) || PHASES[0];
  }

  function getPhaseProgress(phaseId) {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    const completedWeeks = progress.completedWeeks || [];
    const phase = PHASES.find(p => p.id === phaseId);
    if (!phase) return 0;
    const [start, end] = phase.weeks;
    const total = end - start + 1;
    const done = completedWeeks.filter(w => w >= start && w <= end).length;
    return Math.round((done / total) * 100);
  }

  function markDayComplete(weekNum, dayNum) {
    window.SovereignStorage?.update('academy_progress', (prev = {}) => {
      const completedDays = prev.completedDays || {};
      const key = `${weekNum}-${dayNum}`;
      completedDays[key] = { completedAt: new Date().toISOString() };

      // Check if full week complete
      const week = getWeek(weekNum);
      const totalDays = week?.days?.length || 5;
      const weekDays = Array.from({ length: totalDays }, (_, i) => `${weekNum}-${i + 1}`);
      const allDone = weekDays.every(k => completedDays[k]);

      const completedWeeks = prev.completedWeeks || [];
      if (allDone && !completedWeeks.includes(weekNum)) {
        completedWeeks.push(weekNum);
      }

      return { ...prev, completedDays, completedWeeks };
    });
  }

  function isDayComplete(weekNum, dayNum) {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    return !!(progress.completedDays || {})[`${weekNum}-${dayNum}`];
  }

  function isWeekComplete(weekNum) {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    return (progress.completedWeeks || []).includes(weekNum);
  }

  function saveTestResult(weekNum, score, passed) {
    window.SovereignStorage?.update('academy_progress', (prev = {}) => {
      const testResults = prev.testResults || {};
      testResults[weekNum] = { score, passed, date: new Date().toISOString() };
      return { ...prev, testResults };
    });
  }

  function getTestResult(weekNum) {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    return (progress.testResults || {})[weekNum] || null;
  }

  function getOverallStats() {
    const progress = window.SovereignStorage?.get('academy_progress') || {};
    const completedWeeks = progress.completedWeeks || [];
    const completedDays = Object.keys(progress.completedDays || {}).length;
    const testResults = progress.testResults || {};
    const passedTests = Object.values(testResults).filter(r => r.passed).length;
    const currentWeek = progress.currentWeek || 1;
    const currentPhase = getCurrentPhase();
    const totalXP = (completedWeeks.length * 500) + (completedDays * 50) + (passedTests * 200);

    return {
      completedWeeks: completedWeeks.length,
      completedDays,
      passedTests,
      currentWeek,
      currentPhase: currentPhase.id,
      totalXP,
      percentComplete: Math.round((completedWeeks.length / 130) * 100)
    };
  }

  return {
    getPhases,
    getPhase,
    getWeek,
    getWeeksForPhase,
    getDay,
    getCurrentWeek,
    getCurrentPhase,
    getPhaseProgress,
    markDayComplete,
    isDayComplete,
    isWeekComplete,
    saveTestResult,
    getTestResult,
    getOverallStats,
    PHASES,
    ALL_WEEKS
  };

})();
