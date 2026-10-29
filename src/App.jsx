import { useEffect, useState } from "react";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./App.css";
import "./premium-animations.css";

function exportToCSV(students) {
  const headers = ["Name", "Roll Number", "Subject", "Marks", "Attendance", "Status"];

  const rows = students.map((student) => [
    student.name,
    student.roll,
    student.subject,
    student.marks,
    student.attendance,
    student.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "EduPulse_Students.csv";
  link.click();

  URL.revokeObjectURL(url);
}
function exportAnalyticsReport({
  filteredStudents,
  average,
  passPercentage,
  passCount,
  gradeDistribution,
  atRiskStudents,
}) {
  const doc = new jsPDF();

  // Report heading
  doc.setFontSize(22);
  doc.setTextColor(40, 60, 100);
  doc.text("EduPulse Academic Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    14,
    28
  );

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(40, 60, 100);
  doc.text("Academic Summary", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [["Metric", "Value"]],
    body: [
      ["Total Students", filteredStudents.length],
      ["Average Marks", `${average}/100`],
      ["Pass Percentage", `${passPercentage}%`],
      [
        "Failed Students",
        filteredStudents.length - passCount,
      ],
      [
        "At-Risk Students",
        atRiskStudents.length,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [55, 85, 145] },
  });

  // Grade distribution
  let nextY = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.text("Grade Distribution", 14, nextY);

  autoTable(doc, {
    startY: nextY + 5,
    head: [["Grade", "Marks Range", "Students"]],
    body: gradeDistribution.map((item) => [
      item.grade,
      item.range,
      item.count,
    ]),
    theme: "grid",
    headStyles: { fillColor: [55, 85, 145] },
  });

  // Student directory
  doc.addPage();

  doc.setFontSize(16);
  doc.text("Student Performance Details", 14, 20);

  autoTable(doc, {
    startY: 27,
    head: [[
      "Name",
      "Roll No.",
      "Subject",
      "Marks",
      "Attendance",
      "Result",
    ]],
    body: filteredStudents.map((student) => [
      student.name,
      student.roll,
      student.subject,
      `${student.marks}/100`,
      `${student.attendance}%`,
      student.marks >= 35 ? "Passed" : "Failed",
    ]),
    theme: "striped",
    headStyles: { fillColor: [55, 85, 145] },
    styles: { fontSize: 8 },
  });

  // At-risk students
  doc.addPage();

  doc.setFontSize(16);
  doc.text("At-Risk Students", 14, 20);

  autoTable(doc, {
    startY: 27,
    head: [[
      "Name",
      "Marks",
      "Attendance",
      "Reason",
      "Risk Level",
    ]],
    body: atRiskStudents.length
      ? atRiskStudents.map((student) => [
          student.name,
          `${student.marks}/100`,
          `${student.attendance}%`,
          student.reason,
          student.riskLevel,
        ])
      : [["No at-risk students", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [180, 65, 65] },
    styles: { fontSize: 8 },
  });

  // Download PDF
  doc.save("EduPulse_Academic_Report.pdf");
}
const initialStudents = [
  { id: 1, name: "Aarav Sharma", roll: "STU001", subject: "Computer Science", marks: 92, attendance: 96, status: "Excellent" },
  { id: 2, name: "Priya Verma", roll: "STU002", subject: "Mathematics", marks: 88, attendance: 91, status: "Excellent" },
  { id: 3, name: "Rahul Singh", roll: "STU003", subject: "Physics", marks: 42, attendance: 68, status: "Needs Improvement" },
  { id: 4, name: "Ananya Gupta", roll: "STU004", subject: "Computer Science", marks: 96, attendance: 98, status: "Excellent" },
  { id: 5, name: "Karan Mehta", roll: "STU005", subject: "Mathematics", marks: 28, attendance: 55, status: "Needs Improvement" },
  { id: 6, name: "Sneha Patel", roll: "STU006", subject: "Physics", marks: 81, attendance: 89, status: "Good" },
  { id: 7, name: "Rohan Das", roll: "STU007", subject: "Chemistry", marks: 76, attendance: 85, status: "Good" },
  { id: 8, name: "Ishita Roy", roll: "STU008", subject: "Mathematics", marks: 95, attendance: 97, status: "Excellent" },
  { id: 9, name: "Aditya Kumar", roll: "STU009", subject: "Physics", marks: 63, attendance: 78, status: "Average" },
  { id: 10, name: "Meera Joshi", roll: "STU010", subject: "Computer Science", marks: 87, attendance: 93, status: "Good" },
  { id: 11, name: "Vikram Yadav", roll: "STU011", subject: "Chemistry", marks: 51, attendance: 70, status: "Average" },
  { id: 12, name: "Kavya Nair", roll: "STU012", subject: "Mathematics", marks: 91, attendance: 95, status: "Excellent" },
  { id: 13, name: "Arjun Malhotra", roll: "STU013", subject: "Physics", marks: 35, attendance: 62, status: "Needs Improvement" },
  { id: 14, name: "Simran Kaur", roll: "STU014", subject: "Computer Science", marks: 84, attendance: 88, status: "Good" },
  { id: 15, name: "Dev Mishra", roll: "STU015", subject: "Chemistry", marks: 72, attendance: 82, status: "Average" },
  { id: 16, name: "Tanya Kapoor", roll: "STU016", subject: "Mathematics", marks: 98, attendance: 99, status: "Excellent" },
  { id: 17, name: "Mohit Jain", roll: "STU017", subject: "Physics", marks: 58, attendance: 74, status: "Average" },
  { id: 18, name: "Pooja Reddy", roll: "STU018", subject: "Computer Science", marks: 89, attendance: 92, status: "Good" },
  { id: 19, name: "Yash Thakur", roll: "STU019", subject: "Chemistry", marks: 46, attendance: 65, status: "Needs Improvement" },
  { id: 20, name: "Diya Saxena", roll: "STU020", subject: "Mathematics", marks: 93, attendance: 96, status: "Excellent" }
];

function parseCSVLine(line) {
  const values = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && inQuotes) {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function parseCSVRows(text) {
  // Supports quoted commas and quoted line breaks, not just one physical line per row.
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  const input = String(text || "").replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"' && input[i + 1] === '"' && inQuotes) {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value.trim()); value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = []; value = "";
    } else {
      value += char;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function importStudentsFromCSV(file, setStudents, setImportMessage) {
  if (!file) {
    setImportMessage("Please choose a CSV file first.");
    return;
  }
  if (!/\.csv$/i.test(file.name)) {
    setImportMessage("Please select a .csv file.");
    return;
  }
  setImportMessage("Reading CSV file...");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCSVRows(reader.result);
      if (rows.length < 2) throw new Error("CSV has headings but no student rows.");
      const normalize = (header) => String(header || "").toLowerCase().replace(/\uFEFF/g, "").replace(/[^a-z0-9]/g, "");
      const headers = rows[0].map(normalize);
      const findColumn = (...names) => headers.findIndex((header) => names.includes(header));
      const nameIndex = findColumn("name", "studentname", "fullname", "student");
      const rollIndex = findColumn("roll", "rollnumber", "rollno", "studentid", "id", "registrationnumber", "regno");
      const subjectIndex = findColumn("subject", "course", "coursename", "papersubject");
      const marksIndex = findColumn("marks", "score", "percentage", "mark", "totalmarks");
      const attendanceIndex = findColumn("attendance", "attendancepercentage", "attendancepercent", "attendancepct", "attendancepercentage");
      const missing = [];
      if (nameIndex < 0) missing.push("Name");
      if (rollIndex < 0) missing.push("Roll Number");
      if (subjectIndex < 0) missing.push("Subject");
      if (marksIndex < 0) missing.push("Marks");
      if (attendanceIndex < 0) missing.push("Attendance");
      if (missing.length) throw new Error(`Missing column(s): ${missing.join(", ")}. Required: Name, Roll Number, Subject, Marks, Attendance.`);

      const imported = rows.slice(1).map((row, index) => {
        const name = String(row[nameIndex] || "").trim();
        const roll = String(row[rollIndex] || `IMPORTED-${Date.now()}-${index + 1}`).trim();
        const subject = String(row[subjectIndex] || "Other").trim() || "Other";
        const marksText = String(row[marksIndex] ?? "").replace(/%/g, "").trim();
        const attendanceText = String(row[attendanceIndex] ?? "").replace(/%/g, "").trim();
        const marks = Number(marksText);
        const attendance = Number(attendanceText);
        if (!name || !roll || marksText === "" || attendanceText === "" || !Number.isFinite(marks) || !Number.isFinite(attendance) || marks < 0 || marks > 100 || attendance < 0 || attendance > 100) return null;
        return {
          id: `import-${Date.now()}-${index}`,
          name, roll, subject, marks, attendance,
          status: marks >= 80 ? "Excellent" : marks >= 65 ? "Good" : marks >= 40 ? "Average" : "Needs Improvement",
        };
      }).filter(Boolean);
      if (!imported.length) throw new Error("No valid student rows found. Check that Marks and Attendance are numbers from 0 to 100.");

      setStudents((current) => {
        const existingRolls = new Set(current.map((student) => String(student.roll).trim().toLowerCase()));
        const uniqueImported = imported.filter((student) => !existingRolls.has(String(student.roll).trim().toLowerCase()));
        if (!uniqueImported.length) {
          setImportMessage(`No new students imported: all ${imported.length} roll numbers already exist.`);
          return current;
        }
        setImportMessage(`Successfully imported ${uniqueImported.length} of ${imported.length} valid student row(s). Duplicate roll numbers were skipped.`);
        return [...current, ...uniqueImported];
      });
    } catch (error) {
      setImportMessage(error?.message || "Could not read this CSV file.");
    }
  };
  reader.onerror = () => setImportMessage("Could not read this file. Please try again.");
  reader.readAsText(file);
}

function DashboardApp() {
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem("edupulse_students_v1");
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });
  const [importMessage, setImportMessage] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", text: "Hi! I’m EduPulse Assistant ✨ I can help only with this website: Dashboard, Students, CSV import, marks, attendance, risk flags, reports, exports, filters, FAQ, and student profiles. Ask me about any EduPulse feature." }
  ]);

  // Keep student records across refreshes.
  useEffect(() => {
    try {
      localStorage.setItem("edupulse_students_v1", JSON.stringify(students));
    } catch (error) {
      console.error("Could not save EduPulse students to local storage:", error);
    }
  }, [students]);

  // Import feedback should disappear automatically instead of staying forever.
  useEffect(() => {
    if (!importMessage) return;
    const timer = window.setTimeout(() => setImportMessage(""), 6000);
    return () => window.clearTimeout(timer);
  }, [importMessage]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");
const [selectedSubject, setSelectedSubject] = useState("All");
const [selectedStatus, setSelectedStatus] = useState("All");
const [selectedMarks, setSelectedMarks] = useState("All");
const [sortBy, setSortBy] = useState("default");
const [currentPage, setCurrentPage] = useState(1);
const studentsPerPage = 5;
  // Reset to the first page whenever filters or sorting change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSubject, selectedStatus, selectedMarks, sortBy]);
  const filteredStudents = students.filter((student) => {
  const matchesSearch =
    `${student.name} ${student.roll} ${student.subject}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesSubject =
    selectedSubject === "All" ||
    student.subject === selectedSubject;
const matchesStatus =
  selectedStatus === "All" ||
  (selectedStatus === "Passed" && student.marks >= 35) ||
  (selectedStatus === "Failed" && student.marks < 35);

  const matchesMarks =
  selectedMarks === "All" ||
  (selectedMarks === "Below 40" && student.marks < 40) ||
  (selectedMarks === "40-70" &&
    student.marks >= 40 &&
    student.marks <= 70) ||
  (selectedMarks === "Above 70" && student.marks > 70);
  return matchesSearch && matchesSubject && matchesStatus && matchesMarks;
});

const average = Math.round(
  (filteredStudents.length
    ? filteredStudents.reduce((sum, student) => sum + student.marks, 0) / filteredStudents.length
    : 0)
);

  const passCount = filteredStudents.filter((student) => student.marks >= 35).length;
  const gradeDistribution = [
  {
    grade: "A",
    range: "80–100 Marks",
    count: filteredStudents.filter((student) => student.marks >= 80).length,
    color: "#16a34a",
  },
  {
    grade: "B",
    range: "60–79 Marks",
    count: filteredStudents.filter(
      (student) => student.marks >= 60 && student.marks < 80
    ).length,
    color: "#6366f1",
  },
  {
    grade: "C",
    range: "40–59 Marks",
    count: filteredStudents.filter(
      (student) => student.marks >= 40 && student.marks < 60
    ).length,
    color: "#f59e0b",
  },
  {
    grade: "D",
    range: "Below 40 Marks",
    count: filteredStudents.filter((student) => student.marks < 40).length,
    color: "#ef4444",
  },
];
const atRiskStudents = filteredStudents
  .filter(
    (student) => student.marks < 40 || student.attendance < 75
  )
  .map((student) => {
    const lowMarks = student.marks < 40;
    const lowAttendance = student.attendance < 75;

    return {
      ...student,
      riskLevel:
        lowMarks && lowAttendance
          ? "High Risk"
          : "Needs Attention",
      reason:
        lowMarks && lowAttendance
          ? "Low marks & attendance"
          : lowMarks
          ? "Low marks"
          : "Low attendance",
    };
  });
  const sortedStudents = [...filteredStudents].sort((a, b) => {
  if (sortBy === "marks-high") return b.marks - a.marks;
  if (sortBy === "marks-low") return a.marks - b.marks;
  if (sortBy === "attendance-high") return b.attendance - a.attendance;
  if (sortBy === "attendance-low") return a.attendance - b.attendance;
  if (sortBy === "name") return a.name.localeCompare(b.name);

  return 0;
});
const totalPages = Math.max(
  1,
  Math.ceil(sortedStudents.length / studentsPerPage)
);

const startIndex = (currentPage - 1) * studentsPerPage;

const paginatedStudents = sortedStudents.slice(
  startIndex,
  startIndex + studentsPerPage
);
  const topPerformers = [...students]
  .sort((a, b) => b.marks - a.marks)
  .slice(0, 5);
  const passPercentage = filteredStudents.length
  ? Math.round((passCount / filteredStudents.length) * 100)
  : 0;

  const sendAssistantMessage = (rawText = assistantInput) => {
    const question = String(rawText || "").trim();
    if (!question) return;
    const q = question.toLowerCase();
    const risky = students.filter((student) => Number(student.attendance) < 75 || Number(student.marks) < 40);
    const lowAttendance = students.filter((student) => Number(student.attendance) < 75);
    const avgMarks = students.length ? Math.round(students.reduce((sum, student) => sum + Number(student.marks || 0), 0) / students.length) : 0;
    const supported = /(edupulse|dashboard|student|students|mark|marks|grade|pass|fail|attendance|absent|risk|at.?risk|top performer|top 5|csv|import|export|report|pdf|faq|filter|search|sort|roll number|subject|academic year|profile|popup|refresh|save|local ?storage|data|count|average|avg|overview|button|option|feature|page|section|navigation|help|support)/i.test(q);
    let answer = "";
    if (!supported) {
      answer = "I’m EduPulse Assistant, so I can only answer questions about this EduPulse website and its features. Ask me about the Dashboard, Students, CSV import, marks, attendance, At-Risk Students, Top 5, reports, exports, filters, FAQ, or student profiles.";
    } else if (/(average|\\bavg\\b|overall marks|mean mark)/i.test(q)) {
      answer = `The current average mark is ${avgMarks}/100 across ${students.length} student record(s).`;
    } else if (/(risk|at.?risk|low mark|struggling)/i.test(q)) {
      answer = risky.length ? `The current risk rule flags ${risky.length} student(s) with marks below 40 or attendance below 75%: ${risky.slice(0, 10).map((student) => `${student.name} (${student.roll})`).join(", ")}${risky.length > 10 ? ", and more" : ""}. Open the At-Risk Students section and select a student to review their profile.` : "No students currently meet the app’s risk flags (marks below 40 or attendance below 75%).";
    } else if (/(attendance|absent|below 75|percentage)/i.test(q)) {
      answer = `${lowAttendance.length} student(s) currently have attendance below 75%. ${lowAttendance.length ? lowAttendance.slice(0, 10).map((student) => `${student.name} (${student.attendance}%)`).join(", ") : "Everyone is at or above 75% attendance."}`;
    } else if (/(top|best|highest mark|performer|top 5)/i.test(q)) {
      const top = [...students].sort((a,b) => Number(b.marks || 0) - Number(a.marks || 0)).slice(0, 5);
      answer = top.length ? `Top performers by marks:\n${top.map((student, i) => `${i + 1}. ${student.name} — ${student.marks}/100`).join("\n")}\nSelect a student in the Top 5 section to open their profile.` : "There are no student records to rank yet.";
    } else if (/(import|csv|upload)/i.test(q)) {
      answer = "CSV import: open Students → Import CSV and choose a .csv file. The header row must contain these exact columns: Name, Roll Number, Subject, Marks, Attendance. Keep roll numbers unique, and use numeric marks/attendance values (attendance can be a number such as 82). If a column is missing, the app shows a Missing column(s) message. After import, check the student table and the success/error message.";
    } else if (/(export|download|pdf|report)/i.test(q)) {
      answer = "On the current page, use the available Export Overview, Download PDF Report, or Export CSV buttons. Export Overview saves a summary, PDF Report downloads a report, and Export CSV downloads tabular data. Button availability can depend on which page you’re viewing.";
    } else if (/(filter|search|sort|subject|result|marks filter|default order)/i.test(q)) {
      answer = "On Students, use the Subject, Results, and Marks dropdowns to filter records; use the order dropdown to sort; and use Search students to find a student. You can combine filters and search to narrow the table.";
    } else if (/(faq|frequently asked|help center)/i.test(q)) {
      answer = "Open FAQ in the left sidebar for help about CSV imports, duplicate roll numbers, grade rules, At-Risk identification, and exporting data.";
    } else if (/(profile|popup|top 5|student details|close|scroll)/i.test(q)) {
      answer = "Select a student from Top 5 Performers or At-Risk Students to open their profile popup. Use the × button to close it; if the profile is taller than the available space, scroll inside the popup.";
    } else if (/(refresh|save|persist|local ?storage|data disappear|data gone)/i.test(q)) {
      answer = "Student records are saved in this browser’s localStorage, so they should remain after refresh on the same browser/device. Clearing browser site data, using a different browser/device, or changing the app’s storage key can make them unavailable. This is local storage, not cloud sync.";
    } else if (/(how many|total student|student count|records)/i.test(q)) {
      answer = `There are ${students.length} student record(s) currently loaded in EduPulse.`;
    } else if (/(pass|fail|grade|result)/i.test(q)) {
      const passed = students.filter((student) => Number(student.marks) >= 35).length;
      answer = `Based on the app’s current simple pass rule (marks ≥ 35), ${passed} student(s) pass and ${students.length - passed} are below the pass mark. Check the student record for its displayed result.`;
    } else if (/(dashboard|overview|page|section|option|feature|button|navigation|academic year)/i.test(q)) {
      answer = "EduPulse sections: Dashboard gives an academic overview; Students contains the directory, CSV import, search, filters, sorting, and student profiles; Analytics shows academic trends; Reports provides overview/PDF/CSV exports; FAQ explains common workflows; and the AI Assistant answers questions about these features. Student data is currently stored in this browser’s localStorage.";
    } else {
      answer = "I can answer only about EduPulse website features and the student data shown in it. Try asking about CSV import, Dashboard, Top 5, At-Risk Students, attendance, marks, filters, reports, exports, FAQ, or saved data.";
    }
    setAssistantMessages((previous) => [...previous, { role: "user", text: question }, { role: "assistant", text: answer }]);
    setAssistantInput("");
  };

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Students", icon: "♙" },
    { name: "Analytics", icon: "▥" },
    { name: "Reports", icon: "▤" },
    { name: "FAQ", icon: "?" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div>
            <h2>EduPulse</h2>
            <span>ACADEMIC INTELLIGENCE</span>
          </div>
        </div>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom ep-sidebar-footer">
          <div className="profile">
            <div className="avatar">AP</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>EduPulse Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <div className="academic-year">2026–27 Academic Year</div>
            <button
              className="notification"
              aria-label="Notifications"
              onClick={() => alert("You're all caught up!")}
            >
              ♧<i></i>
            </button>
            <div className="top-avatar">AP</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">OVERVIEW</div>
              <h1>
                {activePage === "Dashboard"
                  ? "Student Performance"
                  : activePage}
              </h1>
              <p className="page-subtitle">
                Track academic progress and make data-driven decisions.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => window.print()}
            >
              <span>↗</span> Export Overview
            </button>
            <button
  className="primary-button"
  onClick={() =>
    exportAnalyticsReport({
      filteredStudents,
      average,
      passPercentage,
      passCount,
      gradeDistribution,
      atRiskStudents,
    })
  }
  style={{ marginLeft: "10px" }}
>
  ↓ Download PDF Report
</button>
            <button
  className="primary-button"
  onClick={() => exportToCSV(filteredStudents)}
  style={{ marginLeft: "10px" }}
>
  ↓ Export CSV
</button>
          </div>

          {activePage === "FAQ" && (
            <section
              className="faq-page"
              style={{
                background: "#ffffff",
                border: "1px solid #e8edf5",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                maxWidth: "900px",
              }}
            >
              <div style={{ marginBottom: "22px" }}>
                <div className="eyebrow">HELP CENTER</div>
                <h2 style={{ margin: "8px 0", color: "#172033", fontSize: "26px" }}>
                  Frequently Asked Questions
                </h2>
                <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
                  Quick answers to common questions about using EduPulse.
                </p>
              </div>
              {[
                {
                  question: "How do I import students using a CSV file?",
                  answer: "Open Students and click Import CSV. Choose a .csv file with columns for student name, roll number, subject, marks and attendance. Make sure the first row contains column headings.",
                },
                {
                  question: "What happens if a roll number already exists?",
                  answer: "EduPulse skips imported records whose roll number already exists, helping prevent duplicate student entries.",
                },
                {
                  question: "How are student grades calculated?",
                  answer: "The dashboard groups marks into bands: A is 80–100, B is 60–79, C is 40–59, and D is below 40. Students scoring below 35 are marked as failed in the current dashboard logic.",
                },
                {
                  question: "How are at-risk students identified?",
                  answer: "Students are flagged when marks are below 40 or attendance is below 75%. Students meeting both conditions are shown as High Risk.",
                },
                {
                  question: "Can I export student data?",
                  answer: "Yes. Use Export CSV to download student records as a CSV file, or Download PDF Report to generate a report. The export uses the currently filtered student data where applicable.",
                },
                {
                  question: "Will imported students remain after I refresh the page?",
                  answer: "Currently, imported records are stored in the page's React state. They may reset when the page is refreshed. Persistent storage such as a database or local storage would be needed to keep them between sessions.",
                },
                {
                  question: "How do I find a specific student?",
                  answer: "Open Students and use the search field. You can also filter by subject, pass/fail status and marks range, then sort the results.",
                },
              ].map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0 ? undefined : false}
                  style={{
                    borderTop: "1px solid #e8edf5",
                    padding: "17px 0",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      color: "#172033",
                      fontWeight: 650,
                      lineHeight: 1.5,
                      listStylePosition: "outside",
                    }}
                  >
                    {item.question}
                  </summary>
                  <p style={{ color: "#64748b", lineHeight: 1.75, margin: "12px 0 0" }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </section>
          )}

          {activePage === "Dashboard" && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Students</span>
                <div className="stat-icon blue">♙</div>
              </div>
              <h2>{filteredStudents.length.toLocaleString("en-IN")}</h2>
              <div className="stat-foot">
                <span className="trend positive">↑ 12.5%</span>
                <span>vs. last semester</span>
              </div>
              <div className="mini-bars">
                {[35, 52, 42, 68, 48, 75, 58, 90, 65, 80, 60, 100].map(
                  (height, index) => (
                    <i key={index} style={{ height: `${height}%` }} />
                  )
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Average Marks</span>
                <div className="stat-icon purple">▤</div>
              </div>
              <h2>{average}<small>/100</small></h2>
              <div className="stat-foot">
                <span className="trend positive">↑ 4.8%</span>
                <span>vs. last semester</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill purple-fill" style={{ width: `${average}%` }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Pass Percentage</span>
                <div className="stat-icon green">✓</div>
              </div>
              <h2>{passPercentage}<small>%</small></h2>
              <div className="stat-foot">
                <span className="trend positive">↑ 2.3%</span>
                <span>vs. last semester</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill green-fill" style={{ width: `${passPercentage}%` }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Avg. Attendance</span>
                <div className="stat-icon orange">◷</div>
              </div>
              <h2>
                {filteredStudents.length
                  ? Math.round(
                      filteredStudents.reduce(
                        (sum, student) => sum + student.attendance,
                        0
                      ) / filteredStudents.length
                    )
                  : 0}
                <small>%</small>
              </h2>
              <div className="stat-foot">
                <span className="trend negative">↓ 1.2%</span>
                <span>vs. last semester</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill orange-fill" style={{ width: "83%" }} />
              </div>
            </div>
          </div>
          )}

          {(activePage === "Dashboard" || activePage === "Analytics") && (
          <div className="content-grid">
            <section className="panel performance-panel">
              <div className="panel-heading">
                <div>
                  <h3>Subject Performance</h3>
                  <p>Average marks across key subjects</p>
                </div>
                <span className="badge">2026–27</span>
              </div>

              <div className="chart-legend">
                <span><i className="legend-dot legend-blue" /> Average Marks</span>
                <span><i className="legend-dot legend-light" /> Target (80)</span>
              </div>

             <div className="bar-chart">
  {["Computer Science", "Mathematics", "Physics", "Chemistry"].map(
    (subject) => {
      const subjectStudents = filteredStudents.filter(
        (student) => student.subject === subject
      );

      const averageMarks = subjectStudents.length
        ? Math.round(
            subjectStudents.reduce(
              (sum, student) => sum + student.marks,
              0
            ) / subjectStudents.length
          )
        : 0;

      return (
        <div className="bar-column" key={subject}>
          <div className="bar-value">
            {subjectStudents.length ? averageMarks : "—"}
          </div>

          <div className="bar-track">
            <div className="target-line" />
            <div
              className="bar-fill"
              style={{ height: `${averageMarks}%` }}
            />
          </div>

          <span className="bar-label">
            {subject === "Computer Science"
              ? "Computer Sci."
              : subject}
          </span>
        </div>
      );
    }
  )}
</div>
            </section>

            <section className="panel distribution-panel">
              <div className="panel-heading">
                <div>
                  <h3>Result Distribution</h3>
                  <p>Student pass and fail ratio</p>
                </div>
                <button
                  className="dots-button"
                  onClick={() => alert("Showing current result distribution")}
                >
                  •••
                </button>
              </div>

              <div
                className="donut"
                style={{
                  background: `conic-gradient(#6366f1 0% ${passPercentage}%, #f3a6a6 ${passPercentage}% 100%)`,
                }}
              >
                <div className="donut-inner">
                  <strong>{passPercentage}%</strong>
                  <span>Pass rate</span>
                </div>
              </div>

              <div className="distribution-legend">
                <div>
                  <span><i className="legend-dot legend-blue" /> Passed</span>
                  <strong>{passCount} students</strong>
                </div>
                <div>
                  <span><i className="legend-dot legend-red" /> Failed</span>
                  <strong>{filteredStudents.length - passCount} students</strong>
                </div>
              </div>
            </section>
          </div>
          )}

          {activePage === "Dashboard" && (
<section
  className="panel"
  style={{ marginBottom: "24px", padding: "24px" }}
>
  <div className="panel-heading">
    <div>
      <h3>🏆 Top 5 Performers</h3>
      <p>Students ranked by highest marks</p>
    </div>
    <span className="badge">Top Performers</span>
  </div>

  <div style={{ overflowX: "auto" }}>
    <table>
      <thead>
        <tr>
          <th>RANK</th>
          <th>STUDENT</th>
          <th>SUBJECT</th>
          <th>MARKS</th>
        </tr>
      </thead>

      <tbody>
        {topPerformers.map((student, index) => (
          <tr
  key={student.id}
  onClick={() => setSelectedStudent(student)}
  style={{ cursor: "pointer" }}
>
            <td>
              {["🥇", "🥈", "🥉", "4", "5"][index]}
            </td>
            <td>
              <strong>{student.name}</strong>
            </td>
            <td>{student.subject}</td>
            <td>
              <strong>{student.marks}/100</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
          )}
          {(activePage === "Analytics" || activePage === "Reports") && (
          <>
         <section
  className="panel"
  style={{ marginBottom: "24px", padding: "24px" }}
>
  <div className="panel-heading">
    <div>
      <h3>📊 Grade Distribution</h3>
      <p>Student performance grouped by marks</p>
    </div>
    <span className="badge">Academic Grades</span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginTop: "20px",
    }}
  >
    {gradeDistribution.map((item) => (
      <div
        key={item.grade}
        style={{
          padding: "18px",
          border: "1px solid #eee",
          borderRadius: "12px",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong style={{ fontSize: "18px" }}>
            Grade {item.grade}
          </strong>

          <span
            style={{
              background: item.color,
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            {item.count}
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "#777", margin: "10px 0" }}>
          {item.range}
        </p>

        <div
          style={{
            height: "8px",
            background: "#eee",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${
                filteredStudents.length
                  ? (item.count / filteredStudents.length) * 100
                  : 0
              }%`,
              background: item.color,
              borderRadius: "10px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p style={{ fontSize: "13px", marginTop: "10px", color: "#555" }}>
          {filteredStudents.length
            ? Math.round((item.count / filteredStudents.length) * 100)
            : 0}
          % of selected students
        </p>
      </div>
    ))}
  </div>
</section>
         <section
  className="panel"
  style={{ marginBottom: "24px", padding: "24px" }}
>
  <div className="panel-heading">
    <div>
      <h3>⚠️ At-Risk Students</h3>
      <p>Students who may need additional academic support</p>
    </div>

    <span className="badge">
      {atRiskStudents.length} Students
    </span>
  </div>

  <div style={{ overflowX: "auto", marginTop: "16px" }}>
    <table>
      <thead>
        <tr>
          <th>STUDENT</th>
          <th>MARKS</th>
          <th>ATTENDANCE</th>
          <th>REASON</th>
          <th>RISK LEVEL</th>
        </tr>
      </thead>

      <tbody>
        {atRiskStudents.map((student) => (
          <tr
  key={student.id}
  onClick={() => setSelectedStudent(student)}
  style={{ cursor: "pointer" }}
>
            <td>
              <strong>{student.name}</strong>
            </td>

            <td>{student.marks}/100</td>

            <td>{student.attendance}%</td>

            <td>{student.reason}</td>

            <td>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color:
                    student.riskLevel === "High Risk"
                      ? "#b91c1c"
                      : "#9a5b00",
                  background:
                    student.riskLevel === "High Risk"
                      ? "#fee2e2"
                      : "#fef3c7",
                }}
              >
                {student.riskLevel}
              </span>
            </td>
          </tr>
        ))}

        {atRiskStudents.length === 0 && (
          <tr>
            <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
              🎉 No at-risk students found for the selected filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
          </>
          )}

          {activePage === "Students" && (
          <section className="panel students-panel">
            <div className="panel-heading students-heading" style={{display:"block", width:"100%"}}>
              <div className="students-title-row" style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"20px", flexWrap:"wrap", width:"100%"}}>
                <div style={{minWidth:0, flex:"1 1 240px"}}>
                  <h3>Student Directory</h3>
                  <p>Monitor and review individual student performance</p>
                </div>
                <div
                  className="attendance-alert"
                  style={{padding:"10px 14px", borderRadius:"10px", background:"#fff4e5", color:"#9a5b00", fontSize:"13px", fontWeight:"600", border:"1px solid #ffe2b8", flex:"0 1 auto"}}
                >
                  ⚠️ Low Attendance Alert: {students.filter((student) => student.attendance < 75).length} students have attendance below 75%.
                </div>
              </div>

              <input
                id="students-csv-import"
                type="file"
                accept=".csv,text/csv"
                style={{display:"none"}}
                onChange={(event) => {
                  importStudentsFromCSV(event.target.files?.[0], setStudents, setImportMessage);
                  event.target.value = "";
                }}
              />

              <div className="student-controls" style={{display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap", width:"100%", marginTop:"22px"}}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => document.getElementById("students-csv-import")?.click()}
                  style={{whiteSpace:"nowrap", minHeight:"44px", padding:"11px 18px", borderRadius:"11px", flex:"0 0 auto"}}
                >
                  ↑ Import CSV
                </button>
                <select className="student-filter" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
                  <option value="All">All Subjects</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
                <select className="student-filter" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                  <option value="All">All Results</option>
                  <option value="Passed">Passed Students</option>
                  <option value="Failed">Failed Students</option>
                </select>
                <select className="student-filter" value={selectedMarks} onChange={(event) => setSelectedMarks(event.target.value)}>
                  <option value="All">All Marks</option>
                  <option value="Below 40">Below 40</option>
                  <option value="40-70">40-70 Marks</option>
                  <option value="Above 70">Above 70</option>
                </select>
                <select className="student-filter student-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="default">Default Order</option>
                  <option value="marks-high">Marks: Highest First</option>
                  <option value="marks-low">Marks: Lowest First</option>
                  <option value="attendance-high">Attendance: Highest First</option>
                  <option value="attendance-low">Attendance: Lowest First</option>
                  <option value="name">Name: A–Z</option>
                </select>
                <label className="search-box student-search" style={{display:"flex", alignItems:"center", gap:"8px", minHeight:"44px", padding:"0 12px", flex:"1 1 180px", minWidth:"180px", boxSizing:"border-box"}}>
                  <span>⌕</span>
                  <input type="search" placeholder="Search students..." value={search} onChange={(event) => setSearch(event.target.value)} style={{border:0, outline:0, boxShadow:"none", minWidth:0, width:"100%", background:"transparent"}} />
                </label>
              </div>
              {importMessage && (
                <p role="status" style={{marginTop:"12px", fontSize:"13px", color:importMessage.startsWith("Successfully") ? "#16803c" : "#b45309"}}>
                  {importMessage}
                </p>
              )}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>ROLL NUMBER</th>
                    <th>SUBJECT</th>
                    <th>MARKS</th>
                    <th>ATTENDANCE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className={`student-avatar avatar-${student.id}`}>
                            {student.name.split(" ").map((part) => part[0]).join("")}
                          </div>
                          <strong>{student.name}</strong>
                        </div>
                      </td>
                      <td className="muted-cell">{student.roll}</td>
                      <td>{student.subject}</td>
                      <td>
                        <div className="marks-cell">
                          <strong>{student.marks}</strong>
                          <div className="mini-progress">
                            <i style={{ width: `${student.marks}%` }} />
                          </div>
                        </div>
                      </td>
                     <td>
  <span
    style={{
      color: student.attendance < 75 ? "#dc2626" : "#15803d",
      fontWeight: "600"
    }}
  >
    {student.attendance}%
  </span>
  {student.attendance < 75 && (
    <span style={{ fontSize: "11px", marginLeft: "5px" }}>
      ⚠️ Low
    </span>
  )}
</td>
                      <td>
                        <span className={`status ${student.marks >= 35 ? "passed" : "failed"}`}>
                          <i />
                          {student.marks >= 35 ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No students found. Try another search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "18px 0",
    flexWrap: "wrap",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
    <button
      type="button"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
      style={{
        padding: "9px 12px",
        borderRadius: "9px",
        border: "1px solid #e2e8f0",
        background: currentPage === 1 ? "#f8fafc" : "#ffffff",
        color: currentPage === 1 ? "#94a3b8" : "#334155",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      ← Previous
    </button>

    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
      <button
        type="button"
        key={page}
        aria-current={currentPage === page ? "page" : undefined}
        onClick={() => setCurrentPage(page)}
        style={{
          minWidth: "36px",
          height: "36px",
          padding: "0 10px",
          borderRadius: "9px",
          border: currentPage === page ? "1px solid #6366f1" : "1px solid #e2e8f0",
          background: currentPage === page ? "#6366f1" : "#ffffff",
          color: currentPage === page ? "#ffffff" : "#334155",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 700,
          boxShadow: currentPage === page ? "0 3px 8px rgba(71,118,230,0.22)" : "none",
        }}
      >
        {page}
      </button>
    ))}

    <button
      type="button"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      style={{
        padding: "9px 12px",
        borderRadius: "9px",
        border: "1px solid #e2e8f0",
        background: currentPage === totalPages ? "#f8fafc" : "#ffffff",
        color: currentPage === totalPages ? "#94a3b8" : "#334155",
        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      Next →
    </button>
  </div>
</div>
            <div className="table-footer">
              <span>
                Showing <strong>{sortedStudents.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + studentsPerPage, sortedStudents.length)}</strong>
                {" "}of <strong>{sortedStudents.length}</strong> matching students
              </span>
              <span className="footer-note">Sample academic data</span>
            </div>
          </section>
          )}

          <footer className="page-footer">
            <span>© 2026 EduPulse Analytics</span>
            <span>Built for smarter learning <b>✦</b></span>
          </footer>
        </section>
      {selectedStudent && (
  <div
    onClick={() => setSelectedStudent(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(8, 15, 35, 0.72)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
      animation: "eduModalFadeIn .22s ease-out",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
        color: "#172554",
        border: "1px solid rgba(255,255,255,.8)",
        borderRadius: "26px",
        padding: "30px",
        width: "100%",
        maxWidth: "480px",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        overscrollBehavior: "contain",
        position: "relative",
        boxSizing: "border-box",
        boxShadow: "0 25px 70px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "14px",
          position: "sticky",
          top: "-30px",
          paddingTop: "2px",
          paddingBottom: "12px",
          background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
          zIndex: 2,
        }}
      >
        <div>
          <p style={{ color: "#64748b", margin: 0 }}>
            STUDENT PROFILE
          </p>

          <h2 style={{ marginBottom: "6px", color: "#111827", fontWeight: 800, fontSize: "26px", opacity: 1 }}>
            {selectedStudent.name}
          </h2>

          <span style={{ color: "#64748b" }}>
            {selectedStudent.roll}
          </span>
        </div>

        <button
          onClick={() => setSelectedStudent(null)}
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
            flexShrink: 0,
            color: "#111827",
            fontWeight: 800,
          }}
          aria-label="Close student profile"
        >
          ✕
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginTop: "24px",
        }}
      >
        <div
          style={{
            background: "#eff6ff",
            padding: "18px",
            borderRadius: "14px",
          }}
        >
          <p style={{ margin: 0, color: "#64748b" }}>
            Marks
          </p>

          <h2 style={{ color: "#4f46e5", marginBottom: 0 }}>
            {selectedStudent.marks}/100
          </h2>
        </div>

        <div
          style={{
            background: "#f0fdf4",
            padding: "18px",
            borderRadius: "14px",
          }}
        >
          <p style={{ margin: 0, color: "#64748b" }}>
            Attendance
          </p>

          <h2
            style={{
              color:
                selectedStudent.attendance < 75
                  ? "#dc2626"
                  : "#16a34a",
              marginBottom: 0,
            }}
          >
            {selectedStudent.attendance}%
          </h2>
        </div>
      </div>

      <div style={{ marginTop: "22px" }}>
        <p>
          <strong>Subject:</strong>{" "}
          {selectedStudent.subject}
        </p>

        <p>
          <strong>Result:</strong>{" "}
          <span
            style={{
              color:
                selectedStudent.marks >= 35
                  ? "#16a34a"
                  : "#dc2626",
              fontWeight: "bold",
            }}
          >
            {selectedStudent.marks >= 35 ? "Passed" : "Failed"}
          </span>
        </p>

        <p style={{ color: "#111827", fontWeight: 600 }}>
          <strong style={{ color: "#111827" }}>Academic Risk:</strong>{" "}
          <span style={{ color: "#111827", fontWeight: 700 }}>
          {selectedStudent.marks < 40 &&
          selectedStudent.attendance < 75
            ? "High Risk"
            : selectedStudent.marks < 40 ||
              selectedStudent.attendance < 75
            ? "Needs Attention"
            : "Low Risk"}
          </span>
        </p>
        <div
  style={{
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background:
      selectedStudent.marks < 40 &&
      selectedStudent.attendance < 75
        ? "#fef2f2"
        : selectedStudent.marks < 40 ||
          selectedStudent.attendance < 75
        ? "#fff7ed"
        : "#f0fdf4",
    border: "1px solid #e2e8f0",
  }}
>
  <h4 style={{ marginTop: 0, marginBottom: "12px" }}>
    📌 Academic Recommendations
  </h4>
  {selectedStudent.marks < 40 && selectedStudent.attendance < 75 ? (
    <p>Attend extra classes, improve attendance, and create a daily revision plan.</p>
  ) : selectedStudent.marks < 40 ? (
    <p>Focus on the subject fundamentals and practise questions daily.</p>
  ) : selectedStudent.attendance < 75 ? (
    <p>Improve class attendance and maintain a regular study schedule.</p>
  ) : selectedStudent.marks >= 80 ? (
    <p>Excellent performance! Maintain consistency and help peers when possible.</p>
  ) : (
    <p>Revise regularly, practise weak topics, and aim for higher marks.</p>
  )}
</div>

<div style={{ marginTop: "24px" }}>
  <h4 style={{ marginBottom: "16px" }}>
    📊 Performance Overview
  </h4>

  {/* Marks Progress */}
  <div style={{ marginBottom: "18px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        fontSize: "13px",
      }}
    >
      <strong>Academic Marks</strong>
      <span>{selectedStudent.marks}/100</span>
    </div>

    <div
      style={{
        height: "10px",
        background: "#e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${selectedStudent.marks}%`,
          height: "100%",
          background: "#6366f1",
          borderRadius: "10px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  </div>

  {/* Attendance Progress */}
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        fontSize: "13px",
      }}
    >
      <strong>Attendance</strong>
      <span>{selectedStudent.attendance}%</span>
    </div>

    <div
      style={{
        height: "10px",
        background: "#e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${selectedStudent.attendance}%`,
          height: "100%",
          background:
            selectedStudent.attendance < 75
              ? "#ef4444"
              : "#16a34a",
          borderRadius: "10px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  </div>
</div>

      </div>

      <button
        onClick={() => setSelectedStudent(null)}
        style={{
          width: "100%",
          padding: "13px",
          border: "none",
          borderRadius: "12px",
          background: "#4f46e5",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "12px",
        }}
      >
        Close Profile
      </button>
    </div>
  </div>
)}
      </main>
      {assistantOpen && (
        <section className="ep-assistant-panel" role="dialog" aria-label="EduPulse AI Assistant">
          <div className="ep-assistant-header">
            <div><div style={{fontWeight:800,fontSize:15}}>✦ EduPulse Assistant</div><div style={{fontSize:11,opacity:.85}}>Academic insights · Dashboard helper</div></div>
            <button onClick={() => setAssistantOpen(false)} aria-label="Close assistant" style={{border:0,background:"rgba(255,255,255,.16)",color:"#fff",borderRadius:9,width:32,height:32,fontSize:20,cursor:"pointer"}}>×</button>
          </div>
          <div className="ep-assistant-messages">
            {assistantMessages.map((message, index) => <div key={index} className={`ep-assistant-bubble ${message.role}`}>{message.text}</div>)}
          </div>
          <div className="ep-assistant-suggestions">
            <button onClick={() => sendAssistantMessage("Who is at risk?")}>At-risk students</button>
            <button onClick={() => sendAssistantMessage("What is the average mark?")}>Average marks</button>
            <button onClick={() => sendAssistantMessage("Show top performers")}>Top performers</button>
            <button onClick={() => sendAssistantMessage("How do I import CSV?")}>CSV help</button>
          </div>
          <form className="ep-assistant-form" onSubmit={(event) => { event.preventDefault(); sendAssistantMessage(); }}>
            <input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} placeholder="Ask about your students…" aria-label="Ask EduPulse Assistant" />
            <button type="submit">Send</button>
          </form>
        </section>
      )}
      <button className="ep-assistant-launcher" onClick={() => setAssistantOpen((open) => !open)} aria-label={assistantOpen ? "Close EduPulse Assistant" : "Open EduPulse Assistant"}>
        <span style={{fontSize:18}}>✦</span> {assistantOpen ? "Close Assistant" : "AI Assistant"}
      </button>
    </div>
  );
}

function AuthScreen() {
  const isSignup = window.location.pathname.replace(/\/$/, "") === "/sign-up";
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.history.replaceState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [isLoaded, isSignedIn]);

  return (
    <main className="auth-screen">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <header className="auth-brand-row">
        <a className="auth-brand" href="/" aria-label="EduPulse home">
          <span className="auth-brand-mark">E</span>
          <span>Edu<span>Pulse</span></span>
        </a>
        <span className="auth-secure-label"><span className="auth-live-dot" /> Secure student workspace</span>
      </header>
      <section className="auth-layout">
        <div className="auth-copy">
          <div className="auth-eyebrow"><span>✦</span> YOUR ACADEMIC COMMAND CENTER</div>
          <h1>{isSignup ? <>Build better<br /><span>learning habits.</span></> : <>Your progress.<br /><span>One clear view.</span></>}</h1>
          <p>Bring student records, attendance, performance insights and reports together in one calm, focused workspace.</p>
          <div className="auth-feature-list">
            <div><span className="auth-feature-icon">↗</span><span><strong>See the bigger picture</strong><small>Understand performance at a glance.</small></span></div>
            <div><span className="auth-feature-icon">◈</span><span><strong>Keep everything organised</strong><small>Student data and reports in one place.</small></span></div>
            <div><span className="auth-feature-icon">✧</span><span><strong>Make confident decisions</strong><small>Turn academic data into next steps.</small></span></div>
          </div>
          <div className="auth-footnote"><span>✳</span> Made for clearer academic decisions.</div>
        </div>
        <div className="auth-form-column">
          <div className="auth-glass-card">
            <div className="auth-card-glow" />
            <div className="auth-card-heading">
              <div className="auth-card-symbol">{isSignup ? "✦" : "↗"}</div>
              <div className="auth-card-title">{isSignup ? "Create your account" : "Welcome back"}</div>
              <div className="auth-card-subtitle">{isSignup ? "Start your EduPulse workspace today." : "Sign in to continue to your workspace."}</div>
            </div>
            {!isLoaded ? <div className="auth-loading"><span /> Preparing secure sign in…</div> : isSignup ? (
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            ) : (
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            )}
            <div className="auth-card-bottom"><span className="auth-lock">▣</span> Your account is protected by Clerk authentication.</div>
          </div>
          <div className="auth-form-caption">By continuing, you agree to use EduPulse responsibly.</div>
        </div>
      </section>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} EduPulse</span><span>Designed for focus. Built for progress.</span></footer>
    </main>
  );
}

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    const onClick = (event) => {
      const link = event.target.closest("a[href]");
      if (!link || link.origin !== window.location.origin || !["/", "/sign-in", "/sign-up"].includes(link.pathname)) return;
      event.preventDefault();
      window.history.pushState({}, "", link.pathname);
      setPath(link.pathname);
    };
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", updatePath);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (!isLoaded) return <div className="auth-loading-screen"><div className="auth-loading-mark">E</div><p>Loading EduPulse securely…</p></div>;
  const authPath = path.replace(/\/$/, "");
  if (authPath === "/sign-in" || authPath === "/sign-up") return <AuthScreen />;
  if (!isSignedIn) {
    window.history.replaceState({}, "", "/sign-in");
    return <AuthScreen />;
  }
  return <DashboardApp />;
}

export default App;
