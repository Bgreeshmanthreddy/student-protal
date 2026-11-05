/* Demo student data — plain script so the portal opens straight from disk. */
window.SP = window.SP || {};

SP.student = {
  id: "EU-CSE-2023-0148",
  name: "Aarav Reddy Bomma",
  first: "Aarav",
  program: "B.Tech · Computer Science & Engineering",
  stream: "CSE",
  semester: 5,
  batch: "2023 – 2027",
  section: "CSE-B",
  email: "aarav.reddy@everydayuniv.edu",
  phone: "+91 98490 21174",
  dob: "14 Mar 2005",
  gender: "Male",
  blood: "O+",
  address: "Plot 22, Jubilee Hills, Hyderabad, Telangana 500033",
  guardian: "Suresh Bomma · +91 98490 11223",
  enrollment: "EU23CSE0148",
  advisor: "Dr. Meera Krishnan",
  joined: "03 Aug 2023",
  cgpa: 8.92,
  creditsEarned: 96,
  creditsTotal: 160,
  status: "Regular",
};

/* color keys map to --c-1…--c-6 in main.css */
SP.subjects = [
  { code: "CS501", name: "Design & Analysis of Algorithms", short: "DAA",    faculty: "Dr. Meera Krishnan",  credits: 4, lab: false, room: "A-204", color: "var(--c-1)", attended: 38, total: 44, internal: { asm: 22, quiz: 18, mid: 27, max: 100 } },
  { code: "CS502", name: "Operating Systems",               short: "OS",     faculty: "Prof. Anil Deshmukh", credits: 4, lab: true,  room: "Lab-3",  color: "var(--c-2)", attended: 34, total: 40, internal: { asm: 24, quiz: 17, mid: 29, max: 100 } },
  { code: "CS503", name: "Database Management Systems",     short: "DBMS",   faculty: "Dr. Sara Iqbal",      credits: 4, lab: true,  room: "Lab-1",  color: "var(--c-6)", attended: 36, total: 39, internal: { asm: 25, quiz: 19, mid: 31, max: 100 } },
  { code: "CS504", name: "Computer Networks",               short: "CN",     faculty: "Prof. Rajesh Nair",   credits: 3, lab: true,  room: "B-117",  color: "var(--c-5)", attended: 27, total: 38, internal: { asm: 20, quiz: 15, mid: 24, max: 100 } },
  { code: "CS505", name: "Software Engineering",            short: "SWE",    faculty: "Dr. Priya Menon",     credits: 3, lab: false, room: "A-110",  color: "var(--c-3)", attended: 31, total: 33, internal: { asm: 23, quiz: 16, mid: 28, max: 100 } },
  { code: "HS506", name: "Professional Ethics & Communication", short: "PEC", faculty: "Dr. Kabir Rao",      credits: 2, lab: false, room: "C-004",  color: "var(--c-4)", attended: 19, total: 22, internal: { asm: 21, quiz: 18, mid: 26, max: 100 } },
];

SP.semesters = [
  { sem: 1, credits: 22, sgpa: 8.10, cgpa: 8.10, status: "Passed",   result: "12 Dec 2023" },
  { sem: 2, credits: 22, sgpa: 8.35, cgpa: 8.22, status: "Passed",   result: "18 May 2024" },
  { sem: 3, credits: 24, sgpa: 8.60, cgpa: 8.35, status: "Passed",   result: "14 Dec 2024" },
  { sem: 4, credits: 24, sgpa: 9.05, cgpa: 8.68, status: "Passed",   result: "20 May 2025" },
  { sem: 5, credits: 24, sgpa: null, cgpa: null, status: "In progress", result: "Ends 12 Dec 2026" },
];

/* End-semester marks for the completed semesters, used by results page */
SP.markSheets = [
  { sem: 4, rows: [
    { code: "CS401", name: "Theory of Computation",     credits: 4, theory: 72, internal: 26, total: 98, grade: "A+", point: 9 },
    { code: "CS402", name: "Compiler Design",           credits: 4, theory: 68, internal: 28, total: 96, grade: "A+", point: 9 },
    { code: "CS403", name: "Web Technologies",          credits: 3, theory: 74, internal: 25, total: 99, grade: "O",  point: 10 },
    { code: "CS404", name: "Machine Learning Basics",   credits: 4, theory: 61, internal: 24, total: 85, grade: "A",  point: 8 },
    { code: "EC405", name: "Digital Electronics Lab",   credits: 2, theory: 58, internal: 20, total: 78, grade: "B+", point: 7 },
    { code: "HS406", name: "Economics for Engineers",   credits: 3, theory: 66, internal: 27, total: 93, grade: "A",  point: 8 },
  ]},
  { sem: 3, rows: [
    { code: "CS301", name: "Data Structures",           credits: 4, theory: 70, internal: 27, total: 97, grade: "A+", point: 9 },
    { code: "CS302", name: "Discrete Mathematics",      credits: 4, theory: 55, internal: 22, total: 77, grade: "B+", point: 7 },
    { code: "CS303", name: "Computer Organization",     credits: 4, theory: 63, internal: 25, total: 88, grade: "A",  point: 8 },
    { code: "CS304", name: "Object Oriented Design",    credits: 3, theory: 71, internal: 26, total: 97, grade: "A+", point: 9 },
    { code: "MA305", name: "Probability & Statistics",  credits: 3, theory: 49, internal: 21, total: 70, grade: "B",  point: 6 },
    { code: "IT306", name: "Unix & Shell Programming",  credits: 2, theory: 66, internal: 19, total: 85, grade: "A",  point: 8 },
  ]},
];

/* Attendance across the current semester, one entry per teaching day */
SP.attendanceDays = (function build() {
  var subjects = SP.subjects.map(function (s) { return s.code; });
  var out = [];
  var start = new Date(2026, 7, 3);            // 3 Aug 2026
  var seed = 7;
  function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
  for (var i = 0; i < 66; i++) {
    var d = new Date(start.getTime() + i * 86400000);
    var dow = d.getDay();
    if (dow === 0 || dow === 6) continue;       // weekend
    var hue = rnd();
    var status = hue > 0.86 ? "F" : hue > 0.8 ? "L" : "P";
    out.push({
      date: d.toISOString().slice(0, 10),
      dow: dow,
      status: status,
      subject: subjects[Math.floor(rnd() * subjects.length)],
    });
  }
  return out;
})();

SP.timetable = {
  slots: ["09:00", "10:00", "11:15", "12:15", "14:00", "15:00", "16:15"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  /* key "<day>-<slotIndex>" → subject code; "free" and "lunch" handled below */
  grid: {
    "Mon-0": "CS501", "Mon-1": "CS502", "Mon-3": "CS503", "Mon-4": "CS504", "Mon-5": "CS501",
    "Tue-0": "CS502", "Tue-1": "CS503", "Tue-3": "CS505", "Tue-4": "CS502·Lab", "Tue-5": "CS502·Lab",
    "Wed-0": "CS503", "Wed-1": "CS501", "Wed-3": "HS506", "Wed-4": "CS503·Lab", "Wed-5": "CS503·Lab",
    "Thu-0": "CS504", "Thu-1": "CS505", "Thu-3": "CS501", "Thu-4": "CS504·Lab", "Thu-5": "CS504·Lab",
    "Fri-0": "HS506", "Fri-1": "CS504", "Fri-3": "CS502", "Fri-4": "CS505", "Fri-5": "Mentor",
    "Sat-0": "CS501", "Sat-1": "CS503", "Sat-3": "CS505",
  },
  today: "Wed",
};

SP.exams = [
  { code: "CS503", name: "Database Management Systems", date: "02 Dec 2026", time: "09:30 – 12:30", room: "Hall B", seat: "14", color: "var(--c-6)" },
  { code: "CS501", name: "Design & Analysis of Algorithms", date: "05 Dec 2026", time: "09:30 – 12:30", room: "Hall B", seat: "14", color: "var(--c-1)" },
  { code: "CS502", name: "Operating Systems", date: "08 Dec 2026", time: "14:00 – 17:00", room: "Hall C", seat: "27", color: "var(--c-2)" },
  { code: "CS504", name: "Computer Networks", date: "11 Dec 2026", time: "09:30 – 12:30", room: "Hall A", seat: "08", color: "var(--c-5)" },
  { code: "CS505", name: "Software Engineering", date: "12 Dec 2026", time: "14:00 – 17:00", room: "Hall C", seat: "33", color: "var(--c-3)" },
];

SP.assignments = [
  { title: "AVL vs Red-Black tree benchmarks", code: "CS501", type: "Assignment", due: "07 Nov 2026", progress: 80, status: "in-progress", weight: "10%", pts: "22/25", sub: null },
  { title: "Process scheduler simulation (Round Robin)", code: "CS502", type: "Lab record", due: "05 Nov 2026", progress: 100, status: "submitted", weight: "15%", pts: "24/25", sub: "03 Nov 2026 · 21:14" },
  { title: "Normalization case study — hospital DB", code: "CS503", type: "Assignment", due: "09 Nov 2026", progress: 45, status: "in-progress", weight: "10%", pts: "—", sub: null },
  { title: "TCP congestion control report", code: "CS504", type: "Report", due: "29 Oct 2026", progress: 100, status: "graded", weight: "10%", pts: "19/20", sub: "28 Oct 2026 · 18:02" },
  { title: "Agile sprint retrospective (team)", code: "CS505", type: "Project", due: "14 Nov 2026", progress: 20, status: "in-progress", weight: "20%", pts: "—", sub: null },
  { title: "Ethics debate notes — AI bias", code: "HS506", type: "Assignment", due: "31 Oct 2026", progress: 0, status: "missed", weight: "5%", pts: "0/10", sub: null },
  { title: "Query optimizer mini-survey", code: "CS503", type: "Quiz prep", due: "18 Nov 2026", progress: 0, status: "upcoming", weight: "5%", pts: "—", sub: null },
];

SP.fees = {
  totalAnnual: 185000,
  paid: 120000,
  due: 65000,
  lastDate: "30 Nov 2026",
  lateFee: 1000,
  method: "UPI · HDFC ****4402",
  installments: [
    { id: "INST-01", label: "Installment 1 · Tuition", amount: 60000, due: "15 Sep 2026", status: "paid", paidOn: "12 Sep 2026", receipt: "RC-88213" },
    { id: "INST-02", label: "Installment 2 · Tuition", amount: 60000, due: "30 Oct 2026", status: "paid", paidOn: "27 Oct 2026", receipt: "RC-90455" },
    { id: "INST-03", label: "Installment 3 · Tuition", amount: 45000, due: "30 Nov 2026", status: "due", paidOn: null, receipt: null },
    { id: "INST-04", label: "Exam & laboratory fee",   amount: 20000, due: "20 Dec 2026", status: "upcoming", paidOn: null, receipt: null },
  ],
  history: [
    { date: "27 Oct 2026", label: "Installment 2 · Tuition", method: "UPI · HDFC ****4402", amount: 60000, receipt: "RC-90455" },
    { date: "12 Sep 2026", label: "Installment 1 · Tuition", method: "Net banking · SBI", amount: 60000, receipt: "RC-88213" },
    { date: "05 Sep 2026", label: "Library & student activity", method: "Card · HDFC ****8890", amount: 4500, receipt: "RC-87002" },
  ],
};

SP.notices = [
  { title: "End-semester exam timetable published", body: "Theory papers begin 02 Dec 2026. Seat plans are live on the portal — check your hall and row before 28 Nov.", date: "04 Nov 2026", tag: "Exams", pinned: true, audience: "Sem 4 – 7" },
  { title: "Installment 3 due 30 Nov", body: "Pay ₹45,000 to avoid a ₹1,000 late fee. UPI, net banking and demand draft are accepted.", date: "03 Nov 2026", tag: "Fees", pinned: true, audience: "All years" },
  { title: "Cloud computing elective — 12 seats left", body: "Registration closes 10 Nov. Priority to students with CGPA above 8.0.", date: "02 Nov 2026", tag: "Academics", pinned: false, audience: "CSE" },
  { title: "Campus placement drive: DataMesh", body: "Pre-placement talk 07 Nov, 10:00 in Auditorium. Eligibility: 70% and no active backlog.", date: "01 Nov 2026", tag: "Placements", pinned: false, audience: "Pre-final year" },
  { title: "Library extended hours during exams", body: "Reading halls stay open until 01:00 from 20 Nov to 15 Dec. Night entry needs your ID card.", date: "30 Oct 2026", tag: "Campus", pinned: false, audience: "All" },
  { title: "Project expo submissions moved", body: "Final year project posters now due 18 Nov instead of 20 Nov.", date: "28 Oct 2026", tag: "Academics", pinned: false, audience: "Final year" },
];

SP.notifications = [
  { title: "Grade published", body: "CS504 report scored 19/20.", time: "2 h ago", unread: true, kind: "ok" },
  { title: "Assignment due soon", body: "AVL vs Red-Black trees due 07 Nov.", time: "5 h ago", unread: true, kind: "warn" },
  { title: "Fee reminder", body: "Installment 3 · ₹45,000 due 30 Nov.", time: "Yesterday", unread: true, kind: "info" },
  { title: "New notice pinned", body: "End-semester timetable published.", time: "2 days ago", unread: false, kind: "info" },
];

SP.library = [
  { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest", due: "19 Nov 2026", status: "borrowed", cover: "var(--c-1)" },
  { title: "Operating System Concepts", author: "Silberschatz, Galvin", due: "08 Dec 2026", status: "borrowed", cover: "var(--c-2)" },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", due: "21 Nov 2026", status: "reserved", cover: "var(--c-6)" },
];

SP.grading = [
  { grade: "O",  label: "Outstanding", point: 10, range: "91 – 100" },
  { grade: "A+", label: "Excellent",   point: 9,  range: "81 – 90" },
  { grade: "A",  label: "Very good",   point: 8,  range: "71 – 80" },
  { grade: "B+", label: "Good",        point: 7,  range: "61 – 70" },
  { grade: "B",  label: "Above average", point: 6, range: "51 – 60" },
  { grade: "F",  label: "Fail",        point: 0,  range: "Below 51" },
];

SP.nav = [
  { group: "Overview", items: [
    { id: "dashboard",     label: "Dashboard",     icon: "grid" },
    { id: "timetable",     label: "Timetable",     icon: "calendar" },
    { id: "assignments",   label: "Assignments",   icon: "book", count: 3 },
  ]},
  { group: "My academics", items: [
    { id: "attendance",    label: "Attendance",    icon: "check" },
    { id: "results",       label: "Exam results",  icon: "award" },
    { id: "library",       label: "Library",       icon: "library", count: 2 },
  ]},
  { group: "Money & campus", items: [
    { id: "fees",          label: "Fees",          icon: "wallet", count: 1, alert: true },
    { id: "announcements", label: "Notice board",  icon: "megaphone" },
    { id: "profile",       label: "My profile",    icon: "user" },
  ]},
];

SP.reports = {
  attendanceTrend: [76, 79, 81, 80, 84, 88, 91],   // months Aug → Oct, overall %
  sgpaTrend: [8.10, 8.35, 8.60, 9.05],             // sem 1 → 4
  weeklyHours: [22, 26, 31, 24, 29, 12],           // study hours logged Mon → Sat
  subjectStrength: [78, 84, 88, 66, 82, 74],       // predicted score per subject, aligned to SP.subjects
};
