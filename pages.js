/* Page renderers. Each route returns an HTML string; optional "<route>:mount"
   wires up the interactions for that page. */
(function () {
  "use strict";
  var SP = window.SP, R = SP.routes;
  var icon = SP.icon, esc = SP.esc;

  function byCode(code) {
    var clean = String(code).split("·")[0].trim();
    return SP.subjects.filter(function (s) { return s.code === clean; })[0];
  }
  function subjectTag(s) {
    return `<span class="badge badge--neutral" style="border-color:${s.color};color:${s.color}">${esc(s.short)}</span>`;
  }
  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }
  function daysTo(str) {
    var d = new Date(str.replace(/(\d{2}) (\w{3}) (\d{4})/, "$2 $1, $3"));
    return Math.max(0, Math.ceil((d - new Date()) / 86400000));
  }
  function card(title, hint, body, opts) {
    opts = opts || {};
    return `<section class="card ${opts.class || ""}">
      ${title ? `<div class="card__head"><div><h3 class="card__title">${title}</h3>
        ${hint ? `<div class="card__hint">${hint}</div>` : ""}</div>
        ${opts.action || ""}</div>` : ""}
      <div class="card__body${opts.flush ? " card__body--flush" : ""}">${body}</div>
      ${opts.foot ? `<div class="card__foot">${opts.foot}</div>` : ""}
    </section>`;
  }
  function kpi(label, value, unit, iconName, glow, foot) {
    return `<article class="card kpi" style="--kpi-glow:${glow}">
      <div class="kpi__top"><span class="kpi__label">${label}</span><span class="kpi__icon">${icon(iconName)}</span></div>
      <div class="kpi__value">${value}${unit ? `<small> ${unit}</small>` : ""}</div>
      <div class="kpi__foot">${foot}</div>
    </article>`;
  }
  function trend(dir, text) {
    var cls = dir === "up" ? "trend--up" : dir === "down" ? "trend--down" : "trend--flat";
    var ic = dir === "up" ? "arrowUp" : dir === "down" ? "arrowDown" : "trend";
    return `<span class="trend ${cls}">${icon(ic)}${text}</span>`;
  }
  function emptyState(ic, title, text, action) {
    return `<div class="empty"><div class="empty__art">${icon(ic)}</div>
      <div class="empty__title">${title}</div><div class="empty__text">${text}</div>${action || ""}</div>`;
  }

  /* ══════════════ Dashboard ══════════════ */
  R.dashboard = function () {
    var s = SP.student, att = SP.overallAttend();
    var pending = SP.assignments.filter(function (a) { return a.status === "in-progress" || a.status === "upcoming"; });
    var dueSoon = SP.assignments.filter(function (a) { return a.status === "in-progress" && daysTo(a.due) <= 10; });

    var kpis = `<div class="grid grid--kpi">
      ${kpi("Attendance", att + "%", "", "check", "var(--teal-500)",
        trend(att >= 75 ? "up" : "down", (att >= 75 ? "Eligible" : "Short")) + `<span>75% minimum</span>`)}
      ${kpi("CGPA", s.cgpa.toFixed(2), "", "award", "var(--brand-600)",
        trend("up", "+0.37") + `<span>since Sem 3</span>`)}
      ${kpi("Fees due", SP.money(SP.fees.due), "", "wallet", "var(--amber-500)",
        trend("flat", daysTo(SP.fees.lastDate) + " days left") + `<span>last date ${SP.fees.lastDate}</span>`)}
      ${kpi("Open tasks", pending.length, "", "book", "var(--violet-600)",
        trend("down", dueSoon.length + " due in 10 days") + `<span>of ${SP.assignments.length}</span>`)}
    </div>`;

    var todayRows = SP.timetable.slots.map(function (time, i) {
      var code = SP.timetable.grid[SP.timetable.today + "-" + i];
      if (!code) return "";
      var subj = byCode(code);
      if (!subj) return `<tr><td class="num">${time}</td><td><strong>Free period</strong></td><td>—</td><td>—</td></tr>`;
      var lab = code.indexOf("Lab") > -1;
      return `<tr>
        <td class="table__name num">${time}</td>
        <td><div class="table__name">${subjectTag(subj)}<div><strong>${esc(lab ? subj.name + " · Lab" : subj.name)}</strong>
          <small>${esc(subj.code)} · ${esc(subj.faculty)}</small></div></div></td>
        <td>${icon("pinloc")} <span class="tiny">${esc(lab ? subj.room : subj.room)}</span></td>
        <td>${lab ? SP.badge("warn", "Lab") : SP.badge("info", "Theory")}</td>
      </tr>`;
    }).join("");

    var subjectBars = SP.subjects.map(function (x) {
      return `<div class="bar-row" style="margin-bottom:10px">
        <span style="width:64px;flex:none;font-size:12.5px;font-weight:650;color:${x.color}">${esc(x.short)}</span>
        <div class="bar" style="flex:1"><div class="bar__fill" style="width:${SP.attendPct(x)}%;background:${x.color}"></div></div>
        <span class="bar-row__pct">${SP.attendPct(x)}%</span></div>`;
    }).join("");

    var examSteps = SP.exams.slice(0, 4).map(function (e) {
      var d = daysTo(e.date);
      return `<div class="step ${d > 10 ? "" : "step--live"}">
        <div class="step__dot">${d}</div>
        <div><div class="step__title">${esc(e.name)}</div>
        <div class="step__text">${e.date} · ${e.time} · ${esc(e.room)} · seat ${e.seat}</div></div>
      </div>`;
    }).join("");

    var atRisk = SP.subjects.filter(function (x) { return SP.attendPct(x) < 75; });
    var noticeFeed = SP.notices.slice(0, 3).map(function (n) {
      return `<div class="feed__item" style="padding:14px 0;border-bottom:1px solid var(--border)">
        <div class="feed__icon" style="--feed-c:${n.tag === "Fees" ? "var(--amber-500)" : n.tag === "Exams" ? "var(--rose-500)" : "var(--brand-500)"}">${icon("megaphone")}</div>
        <div><div class="feed__title">${esc(n.title)}</div>
        <div class="feed__meta"><span>${n.date}</span><span>${esc(n.tag)}</span></div></div>
      </div>`;
    }).join("");

    return `
    <div class="page-head">
      <div>
        <h1>${greeting()}, ${esc(s.first)} 👋</h1>
        <p class="page-head__sub">Semester ${s.semester} · ${esc(s.program)} · roll ${esc(s.id)}</p>
      </div>
      <div class="row">
        <a class="btn btn--outline" href="#/timetable">${icon("calendar")}My timetable</a>
        <a class="btn btn--primary" href="#/assignments">${icon("upload")}Submit work</a>
      </div>
    </div>

    ${kpis}

    ${atRisk.length ? `<section class="card" style="border-color:color-mix(in srgb,var(--amber-500) 45%,var(--border));background:color-mix(in srgb,var(--amber-500) 7%,var(--surface))">
      <div class="row row--between">
        <div class="row" style="gap:14px">
          <span class="kpi__icon" style="--kpi-glow:var(--amber-500);width:42px;height:42px">${icon("alert")}</span>
          <div><strong>Attendance shortage in ${atRisk.length} subject${atRisk.length > 1 ? "s" : ""}</strong>
          <div class="tiny muted">${atRisk.map(function (x) { return esc(x.short) + " " + SP.attendPct(x) + "%"; }).join(" · ")} — sit-in exam eligibility needs 75%.</div></div>
        </div>
        <a class="btn btn--sm btn--outline" href="#/attendance">See plan to recover</a>
      </div></section>` : ""}

    <div class="grid grid--sidebar">
      <div class="stack" style="gap:var(--s-5)">
        ${card("Attendance trend", "Overall percentage per month, Aug – Oct 2026",
          SP.line(SP.reports.attendanceTrend, ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
            { min: 60, max: 100, format: function (v) { return Math.round(v) + "%"; }, aria: "Attendance trend by month" }) +
          `<div class="legend"><span class="legend__item"><i class="legend__swatch" style="background:var(--brand-600)"></i>Overall attendance</span>
           <span class="legend__item"><i class="legend__swatch" style="background:var(--amber-500)"></i>75% requirement line</span></div>`,
          { class: "span-2" })}

        ${card("Today's classes · " + SP.timetable.today, "6 periods scheduled · 1 lab block",
          `<div class="table-wrap"><table class="table">
            <thead><tr><th>Time</th><th>Subject</th><th>Room</th><th>Type</th></tr></thead>
            <tbody>${todayRows}</tbody></table></div>`,
          { action: `<a class="btn btn--sm btn--ghost" href="#/timetable">Full week ${icon("arrowRight")}</a>` })}

        ${card("Subject-wise attendance", "Attendance held against total classes conducted",
          `<div class="grid grid--2" style="gap:20px">
            <div>${subjectBars}</div>
            <div style="display:grid;place-items:center">${SP.donut(SP.overallAttend(), { size: 150, caption: "Overall" })}</div>
          </div>`, { class: "span-2" })}
      </div>

      <div class="stack" style="gap:var(--s-5)">
        ${card("Next exams", "Countdown to theory papers", `<div class="steps">${examSteps}</div>`,
          { action: `<a class="btn btn--sm btn--ghost" href="#/results">Timetable</a>` })}

        ${card("Fee snapshot", "Annual 2026–27", `
          <div class="stack" style="gap:14px">
            <div class="row row--between"><span class="muted">Paid so far</span><strong class="num">${SP.money(SP.fees.paid)}</strong></div>
            ${SP.barRow(Math.round(SP.fees.paid / SP.fees.totalAnnual * 100), "ok")}
            <div class="row row--between"><span class="muted">Outstanding</span><strong class="num" style="color:var(--rose-500)">${SP.money(SP.fees.due)}</strong></div>
            <div class="tiny muted">Installment 3 of ₹45,000 due ${SP.fees.lastDate}. Late payment attracts ₹1,000.</div>
            <button class="btn btn--primary btn--block" data-action="pay-now">${icon("card")}Pay now</button>
          </div>`)}

        ${card("Latest notices", "From the office of the registrar", `<div class="feed">${noticeFeed}</div>`,
          { action: `<a class="btn btn--sm btn--ghost" href="#/announcements">All ${SP.notices.length}</a>`,
            foot: `<div class="row row--between tiny muted"><span>Academic calendar · week 13</span><span>${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>` })}
      </div>
    </div>`;
  };

  R["dashboard:mount"] = function (view) {
    var btn = view.querySelector('[data-action="pay-now"]');
    if (btn) btn.addEventListener("click", function () { location.hash = "#/fees"; });
  };

  /* ══════════════ Attendance ══════════════ */
  R.attendance = function (qs) {
    var months = ["Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];
    var sel = qs.subject || "";
    var recs = SP.attendanceDays;
    var present = recs.filter(function (r) { return r.status === "P"; }).length;
    var absent = recs.filter(function (r) { return r.status === "F"; }).length;
    var leaves = recs.filter(function (r) { return r.status === "L"; }).length;

    var rows = SP.subjects.map(function (x) {
      var pct = SP.attendPct(x);
      var need = Math.max(0, Math.ceil(x.total * 0.75) - x.attended);
      return `<tr${sel === x.code ? ' class="is-total"' : ""}>
        <td><div class="table__name"><span class="avatar avatar--sm" style="background:${x.color}">${esc(x.short.slice(0, 2))}</span>
          <div><strong>${esc(x.name)}</strong><small>${esc(x.code)} · ${esc(x.faculty)} · ${x.credits} credits</small></div></div></td>
        <td class="num">${x.attended}/${x.total}</td>
        <td style="min-width:150px">${SP.barRow(pct)}</td>
        <td>${pct >= 75 ? SP.badge("ok", "Eligible") : SP.badge("bad", "Short by " + need)}</td>
        <td class="num">${(x.internal.asm + x.internal.quiz + x.internal.mid)}/${x.internal.max}</td>
        <td><a class="btn btn--sm btn--outline" href="#/attendance?subject=${x.code}">Detail</a></td>
      </tr>`;
    }).join("");

    /* heat calendar: one cell per teaching day, coloured by status */
    var heat = recs.slice(-70).map(function (r) {
      var lvl = r.status === "P" ? "a" : r.status === "L" ? "h" : "x";
      var day = r.date.slice(8, 10);
      return `<div class="heat__cell" data-lvl="${lvl}" title="${r.date} · ${esc((byCode(r.subject) || {}).short || "")} · ${r.status === "P" ? "Present" : r.status === "L" ? "Leave" : "Absent"}">${day}</div>`;
    }).join("");

    var short = SP.subjects.filter(function (x) { return SP.attendPct(x) < 75; });
    var recovery = short.length
      ? short.map(function (x) {
          var need = Math.ceil(x.total * 0.75) - x.attended;
          return `<div class="step step--live"><div class="step__dot">${need}</div>
            <div><div class="step__title">${esc(x.name)}</div>
            <div class="step__text">Attend the next ${need} classes without a break, or file a medical condonation before 25 Nov.</div></div></div>`;
        }).join("")
      : `<div class="row" style="gap:14px;align-items:flex-start;padding:4px 0">
          <span class="kpi__icon" style="--kpi-glow:var(--teal-500)">${icon("check")}</span>
          <div><div class="step__title">Every subject is above 75%</div>
          <div class="step__text">No recovery plan needed right now. The margin is thinnest in ${esc(
            SP.subjects.slice().sort(function (a, b) { return SP.attendPct(a) - SP.attendPct(b); })[0].short
          )}.</div></div></div>`;

    var focus = sel ? byCode(sel) : null;
    var focusDetail = focus ? card(
      "Detail · " + esc(focus.name),
      `${focus.code} · ${esc(focus.faculty)} · room ${esc(focus.room)}`,
      `<div class="grid grid--2" style="gap:20px">
        <div style="display:grid;place-items:center">${SP.donut(SP.attendPct(focus), { size: 160, color: focus.color, color2: "var(--violet-500)", caption: "Held" })}</div>
        <div class="strip" style="grid-template-columns:repeat(2,1fr)">
          <div class="strip__cell"><div class="strip__k">Attended</div><div class="strip__v num">${focus.attended}</div></div>
          <div class="strip__cell"><div class="strip__k">Total held</div><div class="strip__v num">${focus.total}</div></div>
          <div class="strip__cell"><div class="strip__k">Missed</div><div class="strip__v num" style="color:var(--rose-500)">${focus.total - focus.attended}</div></div>
          <div class="strip__cell"><div class="strip__k">Internal</div><div class="strip__v num">${focus.internal.asm + focus.internal.quiz + focus.internal.mid}</div></div>
        </div>
      </div><div class="row" style="margin-top:18px"><a class="btn btn--ghost btn--sm" href="#/attendance">All subjects ${icon("arrowRight")}</a></div>`) : "";

    return `
    <div class="page-head">
      <div><h1>Attendance</h1><p class="page-head__sub">Academic year 2026–27 · updated after every class by the subject faculty</p></div>
      <div class="row">
        <div class="seg" id="attSeg">
          ${months.map(function (m, i) { return `<button data-month="${m}" class="${i === 2 ? "is-active" : ""}">${m}</button>`; }).join("")}
        </div>
        <button class="btn btn--outline" data-action="att-export">${icon("download")}Export</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Overall", SP.overallAttend() + "%", "", "check", "var(--teal-500)", trend(SP.overallAttend() >= 80 ? "up" : "down", "+6% vs Aug"))}
      ${kpi("Classes present", present, "of " + recs.length, "user", "var(--brand-600)", trend("up", Math.round(present / recs.length * 100) + "% participation"))}
      ${kpi("Absenties", absent, "", "alert", "var(--rose-500)", trend("down", "needs " + (SP.overallAttend() >= 75 ? "no action" : "recovery")))}
      ${kpi("Approved leave", leaves, "", "clock", "var(--amber-500)", trend("flat", "medical + event"))}
    </div>

    ${focusDetail}

    <div class="grid grid--sidebar">
      ${card("Subject-wise record", "Eligibility for the end-semester exam needs 75% or a condonation fee",
        `<div class="table-wrap"><table class="table">
          <thead><tr><th>Subject</th><th class="num">Attended</th><th>Percentage</th><th>Status</th><th class="num">Internal</th><th></th></tr></thead>
          <tbody>${rows}</tbody></table></div>`, { flush: true, class: "span-2" })}

      ${card("Class log", "Each square is a teaching day · hover for the subject",
        `<div class="heat">${heat}</div>
         <div class="legend">
           <span class="legend__item"><i class="legend__swatch" style="background:color-mix(in srgb,var(--teal-500) 55%,var(--surface-3))"></i>Present</span>
           <span class="legend__item"><i class="legend__swatch" style="background:color-mix(in srgb,var(--rose-500) 62%,var(--surface-3))"></i>Absent</span>
           <span class="legend__item"><i class="legend__swatch" style="background:var(--surface-3)"></i>Leave / holiday</span>
         </div>`)}

      ${card("How to recover", "Plan the portal suggests for the short subjects",
        `<div class="steps">${recovery}<div class="step step--done"><div class="step__dot">${icon("check")}</div>
          <div><div class="step__title">Lab sessions already counted separately</div>
          <div class="step__text">No additional lab shortfall exists for this semester.</div></div></div></div>`, { class: "span-2" })}
    </div>`;
  };

  R["attendance:mount"] = function (view) {
    view.querySelectorAll("#attSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        view.querySelectorAll("#attSeg button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        SP.toast("Showing " + b.textContent.trim() + " record", "info");
      });
    });
    var ex = view.querySelector('[data-action="att-export"]');
    if (ex) ex.addEventListener("click", function () { SP.toast("attendance_2026-27.pdf queued for download", "ok"); });
  };

  /* ══════════════ Results ══════════════ */
  R.results = function () {
    var internals = SP.subjects.map(function (x) {
      var got = x.internal.asm + x.internal.quiz + x.internal.mid;
      var i = SP.subjects.indexOf(x);
      var pred = SP.reports.subjectStrength[i];
      return `<tr><td><div class="table__name"><span class="avatar avatar--sm" style="background:${x.color}">${esc(x.short.slice(0, 2))}</span>
          <div><strong>${esc(x.name)}</strong><small>${esc(x.code)} · ${x.credits} credits</small></div></div></td>
        <td class="num">${x.internal.asm}/25</td><td class="num">${x.internal.quiz}/20</td><td class="num">${x.internal.mid}/30</td>
        <td style="min-width:140px">${SP.barRow(Math.round(got / x.internal.max * 100))}</td>
        <td class="num"><strong>${got}</strong>/${x.internal.max}</td>
        <td>${pred >= 85 ? SP.badge("ok", "Predicted " + pred) : pred >= 70 ? SP.badge("info", "Predicted " + pred) : SP.badge("warn", "Predicted " + pred)}</td>
      </tr>`;
    }).join("");

    var sheets = SP.markSheets.map(function (m) {
      var sem = SP.semesters.filter(function (x) { return x.sem === m.sem; })[0];
      var rows = m.rows.map(function (r) {
        return `<tr><td class="num">${esc(r.code)}</td><td><strong>${esc(r.name)}</strong></td>
          <td class="num">${r.credits}</td><td class="num">${r.theory}</td><td class="num">${r.internal}</td>
          <td class="num"><strong>${r.total}</strong></td>
          <td><span class="badge ${r.point >= 9 ? "badge--ok" : r.point >= 7 ? "badge--info" : "badge--warn"}">${r.grade}</span></td>
          <td class="num">${r.point}</td></tr>`;
      }).join("");
      var totalPts = m.rows.reduce(function (a, r) { return a + r.point * r.credits; }, 0);
      var totalCr = m.rows.reduce(function (a, r) { return a + r.credits; }, 0);
      return `<h3 style="margin:22px 0 10px">Semester ${m.sem} · SGPA ${sem.sgpa.toFixed(2)}</h3>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Code</th><th>Subject</th><th class="num">Cr</th><th class="num">Theory</th><th class="num">Internal</th><th class="num">Total</th><th>Grade</th><th class="num">Point</th></tr></thead>
          <tbody>${rows}
          <tr class="is-total"><td colspan="2">Semester ${m.sem} summary</td><td class="num">${totalCr}</td><td colspan="3"></td>
          <td class="num">${(totalPts / totalCr).toFixed(2)} SGPA</td><td></td><td class="num">${totalPts}</td></tr>
          </tbody></table></div>`;
    }).join("");

    var grades = SP.grading.map(function (g) {
      return `<tr><td><span class="badge ${g.point >= 9 ? "badge--ok" : g.point >= 7 ? "badge--info" : g.point ? "badge--warn" : "badge--bad"}">${g.grade}</span></td>
        <td>${esc(g.label)}</td><td class="num">${g.range}</td><td class="num">${g.point}</td></tr>`;
    }).join("");

    return `
    <div class="page-head">
      <div><h1>Exam results</h1><p class="page-head__sub">Cumulative CGPA <strong class="num">${SP.student.cgpa.toFixed(2)}</strong> · ${SP.student.creditsEarned} of ${SP.student.creditsTotal} credits earned</p></div>
      <div class="row">
        <button class="btn btn--outline" data-action="grade-calc">${icon("target")}CGPA calculator</button>
        <button class="btn btn--primary" data-action="download-marksheet">${icon("download")}Download mark sheets</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Current CGPA", SP.student.cgpa.toFixed(2), "/ 10", "award", "var(--brand-600)", trend("up", "+0.37") + "<span>this academic year</span>")}
      ${kpi("Credits earned", SP.student.creditsEarned, "/ " + SP.student.creditsTotal, "book", "var(--teal-500)", trend("up", Math.round(SP.student.creditsEarned / SP.student.creditsTotal * 100) + "% of degree"))}
      ${kpi("Best subject", "Web Tech", "", "chart", "var(--violet-600)", trend("up", "99/100 · grade O"))}
      ${kpi("Backlogs", "0", "", "check", "var(--sky-500)", trend("flat", "no arrear records"))}
    </div>

    <div class="grid grid--sidebar">
      ${card("SGPA progression", "Semester 1 through semester 4, plus the current in-progress term",
        SP.line(SP.reports.sgpaTrend, ["Sem 1", "Sem 2", "Sem 3", "Sem 4"], {
          min: 7.5, max: 10, format: function (v) { return v.toFixed(1); }, aria: "SGPA per semester"
        }) + `<div class="legend"><span class="legend__item"><i class="legend__swatch" style="background:var(--brand-600)"></i>Semester grade point average</span>
         <span class="legend__item"><i class="legend__swatch" style="background:var(--teal-500)"></i>Placement shortlist line (8.0)</span></div>`, { class: "span-2" })}

      ${card("Semester ledger", "All six terms of the degree",
        SP.semesters.map(function (x) {
          return `<div class="row row--between" style="padding:9px 0;border-bottom:1px solid var(--border)">
            <div><strong>Sem ${x.sem}</strong><div class="tiny muted">${x.credits} credits · ${x.result}</div></div>
            <div class="row row--tight"><strong class="num">${x.sgpa ? x.sgpa.toFixed(2) : "—"}</strong>
            ${x.sgpa ? SP.badge("ok", "Passed") : SP.badge("neutral", "In progress")}</div></div>`;
        }).join(""), { class: "span-2" })}

      ${card("Study hours logged", "Weekly self-study recorded in the portal diary",
        SP.bars(SP.reports.weeklyHours, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], { color: "var(--teal-500)", color2: "var(--brand-500)", aria: "Study hours per weekday" }),
        { action: `<span class="badge badge--info">${SP.reports.weeklyHours.reduce(function (a, b) { return a + b; }, 0)} h this week</span>` })}
    </div>

    ${card("Semester 5 internals", "Assignment 25 · quiz 20 · midterm 30 · the remaining 25 comes from the end-semester paper",
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>Subject</th><th class="num">Assign</th><th class="num">Quiz</th><th class="num">Mid</th><th>Internal score</th><th class="num">Total</th><th>Prediction</th></tr></thead>
        <tbody>${internals}</tbody></table></div>`, { flush: true, class: "span-2" })}

    ${card("Detailed mark sheets", "Downloadable PDFs are issued by the examination branch", sheets, { flush: true, class: "span-2" })}

    ${card("Grading scale", "How the university converts marks into grade points",
      `<div class="table-wrap"><table class="table"><thead><tr><th>Grade</th><th>Meaning</th><th class="num">Marks</th><th class="num">Point</th></tr></thead><tbody>${grades}</tbody></table></div>`,
      { class: "span-2", foot: `<div class="tiny muted">A course is cleared at 50 marks or above in theory plus internal combined.</div>` })}`;
  };

  R["results:mount"] = function (view) {
    var d = view.querySelector('[data-action="download-marksheet"]');
    if (d) d.addEventListener("click", function () { SP.modal({
      title: "Download mark sheets",
      body: `<p class="muted">Select the semesters to bundle into one PDF.</p>
        <label class="check"><input type="checkbox" checked>Semester 1 – 4 consolidated statement</label>
        <label class="check"><input type="checkbox" checked>Semester 4 detailed marks list</label>
        <label class="check"><input type="checkbox">Consolidated CGPA certificate (₹100 fee)</label>`,
      actions: `<button class="btn btn--ghost" data-close>Cancel</button>
                <button class="btn btn--primary" data-confirm>${icon("download")}Download</button>`,
      onConfirm: function () { SP.toast("marksheet_EU-CSE-2023-0148.pdf downloaded", "ok"); } }); });

    var c = view.querySelector('[data-action="grade-calc"]');
    if (c) c.addEventListener("click", function () { SP.modal({
      title: "CGPA calculator",
      body: `<div class="field"><label>Semester 5 predicted SGPA</label>
        <select class="select" id="calcSgpa"><option>8.0</option><option selected>8.6</option><option>9.0</option><option>9.4</option></select></div>
        <div class="field__hint">Uses ${SP.student.creditsEarned} earned credits at CGPA ${SP.student.cgpa.toFixed(2)} plus 24 credits for semester 5.</div>
        <div class="strip"><div class="strip__cell"><div class="strip__k">Projected CGPA</div><div class="strip__v num" id="calcOut">${SP.student.cgpa.toFixed(2)}</div></div>
        <div class="strip__cell"><div class="strip__k">Credits after Sem 5</div><div class="strip__v num">120</div></div></div>`,
      actions: `<button class="btn btn--ghost" data-close>Close</button>`,
      onMount: function (wrap) {
        var sel = wrap.querySelector("#calcSgpa"), out = wrap.querySelector("#calcOut");
        function upd() {
          var sg = parseFloat(sel.value), earned = SP.student.creditsEarned, cg = SP.student.cgpa;
          out.textContent = (((cg * earned) + (sg * 24)) / (earned + 24)).toFixed(2);
        }
        sel.addEventListener("change", upd); upd();
      } }); });
  };

  /* ══════════════ Timetable ══════════════ */
  R.timetable = function () {
    var t = SP.timetable;
    var head = `<div class="tt__time"></div>` + t.days.map(function (d) {
      return `<div class="tt__dayhead${d === t.today ? " is-today" : ""}">${d}<small>${d === t.today ? "today" : "sem 5"}</small></div>`;
    }).join("");

    var bodyRows = "";
    t.slots.forEach(function (time, i) {
      bodyRows += `<div class="tt__time">${time}</div>`;
      t.days.forEach(function (d) {
        var code = t.grid[d + "-" + i];
        if (!code) { bodyRows += `<div class="tt__slot"></div>`; return; }
        var subj = byCode(code), lab = code.indexOf("Lab") > -1;
        if (!subj) {
          bodyRows += `<div class="tt__class" style="border-left-color:var(--muted);background:var(--surface-2)">
            <strong>Mentor hour</strong><span>Class CSE-B · A-204</span></div>`;
          return;
        }
        bodyRows += `<div class="tt__class${lab ? " tt__class--lab" : ""}"
            style="border-left-color:${subj.color};background:color-mix(in srgb,${subj.color} 12%,var(--surface));color:${subj.color}"
            title="${esc(subj.name)} · ${esc(subj.faculty)}">
          <strong style="color:var(--text)">${esc(subj.short)}${lab ? " lab" : ""}</strong>
          <span>${esc(subj.room)} · ${esc(subj.faculty.split(" ")[0])}</span></div>`;
      });
      if (i === 3) {
        bodyRows += `<div class="tt__time">13:00</div><div class="tt__slot" style="grid-column:1/-1;display:grid;place-items:center;border-style:solid;background:var(--surface-2);color:var(--muted);font-size:12.5px;font-weight:650">Lunch break · 13:00 – 14:00</div>`;
      }
    });

    var credits = SP.subjects.reduce(function (a, s) { return a + s.credits; }, 0);
    var legend = SP.subjects.map(function (s) {
      return `<div class="row row--between" style="padding:9px 0;border-bottom:1px solid var(--border)">
        <div class="row row--tight"><i class="legend__swatch" style="background:${s.color}"></i>
          <div><strong style="font-size:13px">${esc(s.short)}</strong><div class="tiny muted">${esc(s.name)}</div></div></div>
        <div class="row row--tight"><span class="badge badge--neutral">${s.credits} cr</span>
          <span class="tiny muted num">${SP.attendPct(s)}%</span></div></div>`;
    }).join("");

    var dayList = t.slots.map(function (time, i) {
      var code = t.grid[t.today + "-" + i];
      if (!code) return "";
      var s = byCode(code);
      return `<div class="feed__item" style="border-bottom:1px solid var(--border)">
        <div class="feed__icon" style="--feed-c:${s ? s.color : "var(--muted)"}">${icon(s && code.indexOf("Lab") > -1 ? "target" : "book")}</div>
        <div class="row row--between" style="width:100%;gap:12px">
          <div><div class="feed__title">${esc(s ? (code.indexOf("Lab") > -1 ? s.name + " Lab" : s.name) : "Mentor hour")}</div>
          <div class="feed__meta"><span>${time}</span><span>${esc(s ? s.room : "A-204")}</span><span>${esc(s ? s.faculty : "Dr. Meera Krishnan")}</span></div></div>
          <span class="badge badge--neutral">${esc(s ? s.code : "MEN")}</span>
        </div></div>`;
    }).join("");

    return `
    <div class="page-head">
      <div><h1>Class timetable</h1><p class="page-head__sub">Week 13 · 27 Oct – 07 Nov 2026 · ${credits} credits enrolled</p></div>
      <div class="row">
        <div class="seg" id="ttSeg"><button class="is-active" data-view="week">Week grid</button><button data-view="day">Day list</button></div>
        <button class="btn btn--outline" data-action="tt-sync">${icon("calendar")}Add to calendar</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Today", "6", "classes", "calendar", "var(--brand-600)", trend("flat", "11:15 slot free"))}
      ${kpi("This week", "27", "periods", "grid", "var(--teal-500)", trend("up", "3 lab blocks"))}
      ${kpi("Contact hours", "24", "h", "clock", "var(--violet-600)", trend("flat", "per the credit norm"))}
      ${kpi("Free periods", "5", "", "sparkles", "var(--amber-500)", trend("up", "best: Fri 16:15"))}
    </div>

    <div class="card card--flush" style="padding:var(--s-5)">
      <div class="row row--between" style="margin-bottom:var(--s-4)">
        <div><h3 class="card__title">Weekly grid</h3><div class="card__hint">Drag-free, colour-coded by subject. Labs are outlined.</div></div>
      </div>
      <div class="table-wrap"><div class="tt">${head}${bodyRows}</div></div>
    </div>

    <div class="grid grid--sidebar">
      ${card(t.today + "'s schedule", "Tap a class to see the room and faculty", `<div class="feed">${dayList}</div>`, { flush: true })}
      ${card("Subject legend", "Colour · credits · attendance held", legend)}
    </div>`;
  };

  R["timetable:mount"] = function (view) {
    view.querySelectorAll("#ttSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        view.querySelectorAll("#ttSeg button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var week = b.getAttribute("data-view") === "week";
        view.querySelector(".tt").parentElement.style.opacity = week ? "1" : ".45";
        SP.toast(week ? "Week grid view" : "Day list is highlighted in the schedule card below", "info");
      });
    });
    var sync = view.querySelector('[data-action="tt-sync"]');
    if (sync) sync.addEventListener("click", function () { SP.toast("timetable.ics sent to your calendar app", "ok"); });
  };

  /* ══════════════ Assignments ══════════════ */
  var statusMeta = {
    "in-progress": { tone: "warn", label: "In progress" },
    submitted: { tone: "info", label: "Submitted" },
    graded: { tone: "ok", label: "Graded" },
    missed: { tone: "bad", label: "Missed" },
    upcoming: { tone: "neutral", label: "Not started" },
  };

  R.assignments = function () {
    var list = SP.assignments;
    var counts = {};
    list.forEach(function (a) { counts[a.status] = (counts[a.status] || 0) + 1; });
    var graded = list.filter(function (a) { return a.status === "graded" || a.status === "submitted"; });
    var avgScore = Math.round(graded.reduce(function (sum, a) {
      var p = String(a.pts).split("/").map(function (n) { return parseFloat(n); });
      return sum + (p[1] ? (p[0] / p[1]) * 100 : 0);
    }, 0) / (graded.length || 1));

    var chips = [["all", "All " + list.length], ["in-progress", "In progress " + (counts["in-progress"] || 0)],
                 ["submitted", "Submitted " + (counts.submitted || 0)], ["graded", "Graded " + (counts.graded || 0)],
                 ["missed", "Missed " + (counts.missed || 0)]]
      .map(function (c, i) {
        return `<button data-filter="${c[0]}" class="${i === 0 ? "is-active" : ""}">${c[1]}</button>`;
      }).join("");

    return `
    <div class="page-head">
      <div><h1>Assignments & projects</h1><p class="page-head__sub">Semester 5 · ${list.length} items tracked · average submission score ${avgScore}%</p></div>
      <div class="row">
        <input class="input" id="asSearch" placeholder="Filter by title or code…" style="width:230px">
        <select class="select" id="asSort" style="width:170px">
          <option value="due">Sort: due date</option><option value="progress">Sort: progress</option><option value="subject">Sort: subject</option>
        </select>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Open", (counts["in-progress"] || 0) + (counts.upcoming || 0), "", "book", "var(--amber-500)", trend("down", "2 due within a week"))}
      ${kpi("Submitted", counts.submitted || 0, "", "upload", "var(--brand-600)", trend("up", "on time"))}
      ${kpi("Graded", counts.graded || 0, "", "award", "var(--teal-500)", trend("up", avgScore + "% average"))}
      ${kpi("Needs attention", counts.missed || 0, "", "alert", "var(--rose-500)", trend("down", "petition before 20 Nov"))}
    </div>

    <div class="seg" id="asChips" style="flex-wrap:wrap">${chips}</div>

    <div class="grid grid--2" id="asList">${list.map(assignmentCard).join("")}</div>`;
  };

  function assignmentCard(a) {
    var s = byCode(a.code), m = statusMeta[a.status];
    var overdue = a.status === "in-progress" && daysTo(a.due) <= 3;
    return `<article class="card card--hover" data-status="${a.status}" data-due="${daysTo(a.due)}" data-title="${esc((a.title + " " + a.code).toLowerCase())}">
      <div class="row row--between" style="align-items:flex-start">
        <div class="row row--tight"><span class="avatar avatar--sm" style="background:${s ? s.color : "var(--muted)"}">${esc(a.code.slice(-3))}</span>
          <div><div class="tiny muted">${esc(a.code)} · ${esc(a.type)}</div><div class="tiny muted">weight ${esc(a.weight)}</div></div></div>
        ${SP.badge(m.tone, m.label)}
      </div>
      <h3 style="margin:12px 0 4px">${esc(a.title)}</h3>
      <div class="tiny muted">Submit by <strong>${esc(a.due)}</strong>${overdue ? ' · <span style="color:var(--rose-500)">closing soon</span>' : ""}</div>
      <div style="margin:14px 0 10px">${SP.barRow(a.progress, a.progress === 100 ? "ok" : a.progress > 50 ? "" : "warn")}</div>
      <div class="row row--between">
        <span class="tiny muted">${a.sub ? "Submitted " + esc(a.sub) : a.status === "graded" ? "Score " + esc(a.pts) : "No submission yet"}</span>
        <div class="row row--tight">
          <button class="btn btn--sm btn--ghost" data-action="brief">${icon("file")}Brief</button>
          <button class="btn btn--sm btn--primary" data-action="submit">${icon("upload")}${a.progress === 100 ? "View" : "Submit"}</button>
        </div>
      </div></article>`;
  }

  R["assignments:mount"] = function (view) {
    var cards = Array.prototype.slice.call(view.querySelectorAll("#asList > article"));
    var state = { filter: "all", term: "", sort: "due" };
    function apply() {
      cards.forEach(function (c) {
        var okStatus = state.filter === "all" || c.getAttribute("data-status") === state.filter;
        var okTerm = !state.term || c.getAttribute("data-title").indexOf(state.term) > -1;
        c.style.display = okStatus && okTerm ? "" : "none";
      });
      var shown = cards.filter(function (c) { return c.style.display !== "none"; });
      var host = view.querySelector("#asList");
      var none = host.querySelector(".empty");
      if (shown.length === 0) {
        if (!none) host.insertAdjacentHTML("beforeend", emptyState("search", "Nothing matches", "Try a different subject code or clear the filter."));
      } else if (none) none.remove();
    }
    view.querySelectorAll("#asChips button").forEach(function (b) {
      b.addEventListener("click", function () {
        view.querySelectorAll("#asChips button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        state.filter = b.getAttribute("data-filter");
        apply();
      });
    });
    view.querySelector("#asSearch").addEventListener("input", function (e) {
      state.term = e.target.value.trim().toLowerCase(); apply();
    });
    view.querySelector("#asSort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      var host = view.querySelector("#asList");
      cards.sort(function (a, b) {
        if (state.sort === "progress") return parseFloat(b.querySelector(".bar-row__pct").textContent) - parseFloat(a.querySelector(".bar-row__pct").textContent);
        if (state.sort === "subject") return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"));
        return +a.getAttribute("data-due") - +b.getAttribute("data-due");
      });
      cards.forEach(function (c) { host.appendChild(c); });
    });
    view.addEventListener("click", function (e) {
      var sub = e.target.closest('[data-action="submit"]');
      if (sub) {
        var title = sub.closest("article").querySelector("h3").textContent;
        SP.modal({
          title: "Submit work",
          body: `<p class="muted">${esc(title)}</p>
            <div class="field"><label>Attach file</label>
              <div class="card" style="border-style:dashed;text-align:center;padding:26px">
                ${icon("upload")}<div class="strong" style="margin-top:8px">Drag a PDF here or browse</div>
                <div class="tiny muted">Max 20 MB · one file per submission</div></div></div>
            <div class="field"><label>Note for the faculty (optional)</label>
              <textarea class="textarea" placeholder="Describe what you implemented…"></textarea></div>
            <label class="check"><input type="checkbox" checked>I confirm this is my own work.</label>`,
          actions: `<button class="btn btn--ghost" data-close>Save draft</button>
                    <button class="btn btn--primary" data-confirm>Submit now</button>`,
          onConfirm: function () { SP.toast("Submission received · receipt emailed to you", "ok"); } });
        return;
      }
      var br = e.target.closest('[data-action="brief"]');
      if (br) {
        var t = br.closest("article").querySelector("h3").textContent;
        SP.modal({ title: "Task brief", body: `<p class="muted">${esc(t)}</p>
          <div class="strip"><div class="strip__cell"><div class="strip__k">Weight</div><div class="strip__v">10%</div></div>
          <div class="strip__cell"><div class="strip__k">Rubric</div><div class="strip__v">25 marks</div></div>
          <div class="strip__cell"><div class="strip__k">Late policy</div><div class="strip__v">−20%</div></div></div>
          <p style="font-size:13.5px">Deliverables: source code, a two-page report and a short demo video. Submissions after the deadline are accepted for 48 hours with a 20% penalty.</p>`,
          actions: `<button class="btn btn--primary" data-close>Got it</button>` });
      }
    });
  };

  /* ══════════════ Fees ══════════════ */
  R.fees = function () {
    var f = SP.fees, paidPct = Math.round(f.paid / f.totalAnnual * 100);
    var inst = f.installments.map(function (i) {
      var tone = i.status === "paid" ? "ok" : i.status === "due" ? "bad" : "neutral";
      return `<tr><td><div class="table__name"><span class="avatar avatar--sm ${i.status === "paid" ? "avatar--teal" : i.status === "due" ? "avatar--rose" : ""}">${icon(i.status === "paid" ? "check" : i.status === "due" ? "clock" : "wallet")}</span>
        <div><strong>${esc(i.label)}</strong><small>${esc(i.id)} · due ${esc(i.due)}</small></div></div></td>
        <td class="num"><strong>${SP.money(i.amount)}</strong></td>
        <td>${SP.badge(tone, i.status === "paid" ? "Paid " + i.paidOn : i.status === "due" ? "Payable now" : "Upcoming")}</td>
        <td class="num">${i.receipt ? esc(i.receipt) : "—"}</td>
        <td>${i.status === "due"
          ? `<button class="btn btn--sm btn--primary" data-action="pay" data-id="${i.id}" data-amt="${i.amount}">Pay</button>`
          : i.receipt ? `<button class="btn btn--sm btn--outline" data-action="receipt" data-id="${i.receipt}">${icon("download")}Receipt</button>`
          : `<button class="btn btn--sm btn--ghost" disabled>Remind me</button>`}</td></tr>`;
    }).join("");

    var hist = f.history.map(function (h) {
      return `<tr><td class="num">${esc(h.date)}</td><td><strong>${esc(h.label)}</strong></td>
        <td class="tiny muted">${esc(h.method)}</td><td class="num">${SP.money(h.amount)}</td>
        <td><span class="badge badge--ok"><span class="badge__dot"></span>${esc(h.receipt)}</span></td>
        <td>${SP.badge("ok", "Success")}</td></tr>`;
    }).join("");

    return `
    <div class="page-head">
      <div><h1>Fees & payments</h1><p class="page-head__sub">Academic year 2026–27 · ${esc(f.method)} on file</p></div>
      <div class="row">
        <button class="btn btn--outline" data-action="statement">${icon("download")}Fee statement</button>
        <button class="btn btn--primary" data-action="pay" data-id="INST-03" data-amt="${f.due}">${icon("card")}Pay ${SP.money(f.due)}</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Annual fee", SP.money(f.totalAnnual), "", "wallet", "var(--brand-600)", trend("flat", "B.Tech · CSE"))}
      ${kpi("Paid", SP.money(f.paid), "", "check", "var(--teal-500)", trend("up", paidPct + "% cleared"))}
      ${kpi("Outstanding", SP.money(f.due), "", "alert", "var(--amber-500)", trend("down", "due " + esc(f.lastDate)))}
      ${kpi("Late fee", SP.money(f.lateFee), "if missed", "clock", "var(--rose-500)", trend("flat", daysTo(f.lastDate) + " days left"))}
    </div>

    ${card("Payment progress", "Four instalments across the academic year", `
      <div class="row row--between"><span class="muted">${paidPct}% of ${SP.money(f.totalAnnual)} cleared</span>
        <strong class="num">${SP.money(f.paid)} paid</strong></div>
      <div class="bar" style="height:12px;margin:14px 0 20px"><div class="bar__fill bar__fill--ok" style="width:${paidPct}%"></div></div>
      <div class="steps">
        ${f.installments.map(function (i) {
          var cls = i.status === "paid" ? "step--done" : i.status === "due" ? "step--live" : "";
          return `<div class="step ${cls}"><div class="step__dot">${i.status === "paid" ? icon("check") : ""}</div>
            <div class="row row--between" style="width:100%">
              <div><div class="step__title">${esc(i.label)}</div>
                <div class="step__text">${i.status === "paid" ? "Paid " + esc(i.paidOn) + " · receipt " + esc(i.receipt) : "Due " + esc(i.due)}</div></div>
              <strong class="num">${SP.money(i.amount)}</strong></div></div>`;
        }).join("")}
      </div>`, { class: "span-2" })}

    ${card("Instalments", "Each line is separately payable through the portal",
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>Instalment</th><th class="num">Amount</th><th>Status</th><th class="num">Receipt</th><th></th></tr></thead>
        <tbody>${inst}</tbody></table></div>`, { flush: true, class: "span-2" })}

    <div class="grid grid--sidebar">
      ${card("Payment history", "All transactions settled on this account",
        `<div class="table-wrap"><table class="table">
          <thead><tr><th>Date</th><th>Particulars</th><th>Method</th><th class="num">Amount</th><th>Receipt</th><th>Status</th></tr></thead>
          <tbody>${hist}</tbody></table></div>`, { flush: true })}

      ${card("Scholarship & concessions", "Applied to the current bill", `
        <div class="stack" style="gap:12px">
          <div class="row row--between"><span class="muted">State merit scholarship (tier 2)</span><strong class="num" style="color:var(--teal-500)">−₹20,000</strong></div>
          <div class="row row--between"><span class="muted">Alumni sibling concession</span><strong class="num" style="color:var(--teal-500)">−₹5,000</strong></div>
          <div class="row row--between"><span class="muted">Transportation (optional)</span><strong class="num">₹12,000</strong></div>
          <div class="pop__sep"></div>
          <div class="row row--between"><strong>Net payable</strong><strong class="num">${SP.money(f.totalAnnual)}</strong></div>
        </div>
        <p class="tiny muted" style="margin-top:14px">Documents verified by the bursary office on 18 Sep 2026.</p>`,
        { foot: `<div class="row row--between tiny"><span>Need help?</span><a href="#/profile" style="color:var(--brand-600);font-weight:600">Contact the fees desk</a></div>` })}
    </div>`;
  };

  R["fees:mount"] = function (view) {
    view.addEventListener("click", function (e) {
      var pay = e.target.closest('[data-action="pay"]');
      if (pay) {
        var amt = +pay.getAttribute("data-amt");
        SP.modal({
          title: "Pay " + SP.money(amt),
          body: `<div class="strip" style="grid-template-columns:repeat(3,1fr)">
              <div class="strip__cell"><div class="strip__k">Instalment</div><div class="strip__v" style="font-size:14px">${esc(pay.getAttribute("data-id"))}</div></div>
              <div class="strip__cell"><div class="strip__k">Amount</div><div class="strip__v num">${SP.money(amt)}</div></div>
              <div class="strip__cell"><div class="strip__k">Late fee</div><div class="strip__v num">₹0</div></div></div>
            <div class="field"><label>Payment method</label>
              <select class="select"><option>UPI · aarav@okhdfcbank</option><option>Net banking · HDFC</option><option>Debit card · ****4402</option><option>Add new UPI ID</option></select></div>
            <label class="check"><input type="checkbox">Save this as my default method</label>
            <p class="tiny muted">You will receive a receipt on ${esc(SP.student.email)} within a few minutes of success.</p>`,
          actions: `<button class="btn btn--ghost" data-close>Cancel</button>
                    <button class="btn btn--primary" data-confirm>${icon("card")}Pay ${SP.money(amt)}</button>`,
          onConfirm: function () { SP.toast("Payment of " + SP.money(amt) + " successful · receipt RC-91244", "ok"); } });
        return;
      }
      var rec = e.target.closest('[data-action="receipt"]');
      if (rec) SP.toast("Receipt " + rec.getAttribute("data-id") + " downloaded", "ok");
    });
    var s = view.querySelector('[data-action="statement"]');
    if (s) s.addEventListener("click", function () { SP.toast("fee_statement_2026-27.pdf downloaded", "ok"); });
  };

  /* ══════════════ Library ══════════════ */
  R.library = function () {
    var books = SP.library.map(function (b) {
      var d = daysTo(b.due);
      return `<article class="card card--hover">
        <div class="row" style="gap:16px;align-items:flex-start">
          <div style="width:54px;height:72px;border-radius:8px;flex:none;background:linear-gradient(150deg,${b.cover},color-mix(in srgb,${b.cover} 45%,#000));display:grid;place-items:center;color:#fff">${icon("book2")}</div>
          <div style="min-width:0">
            <h3 style="font-size:15px">${esc(b.title)}</h3>
            <div class="tiny muted">${esc(b.author)}</div>
            <div class="row row--tight" style="margin-top:10px">
              ${b.status === "borrowed" ? SP.badge(d <= 7 ? "warn" : "ok", d <= 7 ? "Due in " + d + " days" : "On loan") : SP.badge("info", "Ready to collect")}
              <span class="tiny muted">due ${esc(b.due)}</span>
            </div>
          </div>
        </div>
        <div class="row" style="margin-top:16px">
          <button class="btn btn--sm btn--primary" data-action="renew" data-title="${esc(b.title)}">Renew</button>
          <button class="btn btn--sm btn--outline" data-action="return-book" data-title="${esc(b.title)}">Return</button>
          <button class="btn btn--sm btn--ghost" data-action="fine">${icon("alert")}Fine status</button>
        </div></article>`;
    }).join("");

    return `
    <div class="page-head">
      <div><h1>Library</h1><p class="page-head__sub">Card EU-L-0148 · 3 of 6 loans used · central library block C</p></div>
      <div class="row">
        <input class="input" id="libSearch" placeholder="Search catalogue…" style="width:250px">
        <button class="btn btn--primary" data-action="reserve">${icon("search")}Browse catalogue</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("On loan", SP.library.filter(function (b) { return b.status === "borrowed"; }).length, "books", "book", "var(--brand-600)", trend("flat", "renewable once"))}
      ${kpi("Reserved", SP.library.filter(function (b) { return b.status === "reserved"; }).length, "", "clock", "var(--violet-600)", trend("up", "collect within 3 days"))}
      ${kpi("Fines", "₹0", "", "wallet", "var(--teal-500)", trend("up", "clean record"))}
      ${kpi("Digital access", "12", "journals", "sparkles", "var(--sky-500)", trend("flat", "IEEE + ACM"))}
    </div>

    <div class="grid grid--3" id="libGrid">${books}</div>

    <div class="grid grid--sidebar">
      ${card("Borrow history", "Last six issues and returns", `
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Title</th><th>Code</th><th class="num">Issued</th><th class="num">Returned</th><th>Status</th></tr></thead>
          <tbody>
            ${[["Computer Networking: A Top-Down Approach", "L-CN-2211", "14 Jul 2026", "02 Aug 2026"],
               ["SQL Antipatterns", "L-DB-1187", "20 Jun 2026", "11 Jul 2026"],
               ["The Pragmatic Programmer", "L-SE-0455", "02 May 2026", "26 May 2026"]]
              .map(function (r) {
                return `<tr><td><strong>${esc(r[0])}</strong></td><td class="tiny muted">${esc(r[1])}</td>
                  <td class="num">${r[2]}</td><td class="num">${r[3]}</td><td>${SP.badge("ok", "Returned")}</td></tr>`;
              }).join("")}
            <tr><td><strong>Art of Computer Programming, Vol 1</strong></td><td class="tiny muted">L-MA-0031</td>
              <td class="num">18 Sep 2026</td><td class="num">04 Oct 2026</td><td>${SP.badge("ok", "Returned")}</td></tr>
            <tr><td><strong>Clean Architecture</strong></td><td class="tiny muted">L-SE-0912</td>
              <td class="num">01 Oct 2026</td><td class="num">28 Oct 2026</td><td>${SP.badge("warn", "₹0 fine waived")}</td></tr>
          </tbody></table></div>`, { flush: true })}

      ${card("Reading recommendations", "Picked from your syllabus and predicted weak areas",
        [["DAA", "Algorithm Design · Kleinberg & Tardos", "var(--c-1)"],
         ["CN", "Computer Networks · Tanenbaum", "var(--c-5)"],
         ["SWE", "Software Engineering at Google", "var(--c-3)"]]
          .map(function (r) {
            return `<div class="feed__item" style="border-bottom:1px solid var(--border)">
              <div class="feed__icon" style="--feed-c:${r[2]}">${icon("book")}</div>
              <div><div class="feed__title">${esc(r[1])}</div><div class="feed__meta"><span>supports ${r[0]}</span><span>2 copies available</span></div></div></div>`;
          }).join(""), { flush: true,
            foot: `<div class="row row--between tiny muted"><span>Central library · 08:00 – 22:00</span><span>Exam hours until 01:00</span></div>` })}
    </div>`;
  };

  R["library:mount"] = function (view) {
    view.addEventListener("click", function (e) {
      var r = e.target.closest('[data-action="renew"]');
      if (r) { SP.toast("Renewed · " + r.getAttribute("data-title") + " due 06 Dec 2026", "ok"); return; }
      var ret = e.target.closest('[data-action="return-book"]');
      if (ret) {
        SP.modal({ title: "Return book",
          body: `<p class="muted">${esc(ret.getAttribute("data-title"))} will be marked as returned at the circulation desk today.</p>
            <label class="check"><input type="checkbox" checked>Email me the acknowledgement</label>`,
          actions: `<button class="btn btn--ghost" data-close>Keep it</button><button class="btn btn--primary" data-confirm>Confirm return</button>`,
          onConfirm: function () { SP.toast("Return recorded at desk C-02", "ok"); } });
        return;
      }
      var f = e.target.closest('[data-action="fine"]');
      if (f) SP.modal({ title: "Fine status", body: `<div class="strip" style="grid-template-columns:repeat(2,1fr)">
          <div class="strip__cell"><div class="strip__k">Outstanding</div><div class="strip__v" style="color:var(--teal-500)">₹0</div></div>
          <div class="strip__cell"><div class="strip__k">Lifetime fines</div><div class="strip__v">₹20</div></div></div>
          <p class="tiny muted" style="margin-top:14px">One late return in Oct 2026 was waived by the librarian.</p>`,
          actions: `<button class="btn btn--primary" data-close>Close</button>` });
      var res = e.target.closest('[data-action="reserve"]');
      if (res) SP.toast("Catalogue opened in a new tab", "info");
    });
    var search = view.querySelector("#libSearch");
    search.addEventListener("input", function (e) {
      var term = e.target.value.trim().toLowerCase();
      view.querySelectorAll("#libGrid > article").forEach(function (c) {
        c.style.display = c.textContent.toLowerCase().indexOf(term) > -1 ? "" : "none";
      });
    });
  };

  /* ══════════════ Announcements ══════════════ */
  R.announcements = function () {
    var tags = ["All"];
    SP.notices.forEach(function (n) { if (tags.indexOf(n.tag) < 0) tags.push(n.tag); });
    var sorted = SP.notices.slice().sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
    var feed = sorted.map(function (n, i) {
      var c = n.tag === "Fees" ? "var(--amber-500)" : n.tag === "Exams" ? "var(--rose-500)"
            : n.tag === "Placements" ? "var(--teal-500)" : n.tag === "Campus" ? "var(--sky-500)" : "var(--brand-500)";
      return `<button class="feed__item" data-i="${i}" data-tag="${esc(n.tag)}" data-pinned="${n.pinned ? "1" : "0"}">
        <div class="feed__icon" style="--feed-c:${c}">${icon(n.pinned ? "pin" : "megaphone")}</div>
        <div style="min-width:0">
          <div class="row row--tight" style="align-items:center;margin-bottom:2px">
            <span class="badge badge--neutral" style="color:${c};border-color:${c}">${esc(n.tag)}</span>
            ${n.pinned ? '<span class="badge badge--warn"><span class="badge__dot"></span>Pinned</span>' : ""}
          </div>
          <div class="feed__title">${esc(n.title)}</div>
          <div class="feed__text">${esc(n.body)}</div>
          <div class="feed__meta"><span>${n.date}</span><span>${esc(n.audience)}</span><span style="color:var(--brand-600);font-weight:600">Read details ${icon("arrowRight")}</span></div>
        </div></button>`;
    }).join("");

    return `
    <div class="page-head">
      <div><h1>Notice board</h1><p class="page-head__sub">${SP.notices.filter(function (n) { return n.pinned; }).length} pinned · ${SP.notices.length} notices this month</p></div>
      <div class="row">
        <div class="seg" id="noticeSeg">${tags.map(function (t, i) { return `<button data-tag="${esc(t)}" class="${i === 0 ? "is-active" : ""}">${esc(t)}</button>`; }).join("")}</div>
        <button class="btn btn--outline" data-action="subscribe">${icon("bell")}Subscribe by email</button>
      </div>
    </div>

    <div class="grid grid--kpi">
      ${kpi("Pinned", SP.notices.filter(function (n) { return n.pinned; }).length, "", "pin", "var(--amber-500)", trend("flat", "registrar's office"))}
      ${kpi("Exams", SP.notices.filter(function (n) { return n.tag === "Exams"; }).length, "notice", "award", "var(--rose-500)", trend("up", "papers from 02 Dec"))}
      ${kpi("Fees", SP.notices.filter(function (n) { return n.tag === "Fees"; }).length, "notice", "wallet", "var(--brand-600)", trend("down", "30 Nov deadline"))}
      ${kpi("Placements", SP.notices.filter(function (n) { return n.tag === "Placements"; }).length, "drive", "user", "var(--teal-500)", trend("up", "2 companies visiting"))}
    </div>

    ${card("All notices", "Newest first · pinned items stay on top", `<div class="feed">${feed}</div>`, { flush: true, class: "span-2" })}`;
  };

  R["announcements:mount"] = function (view) {
    view.querySelectorAll("#noticeSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        view.querySelectorAll("#noticeSeg button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var tag = b.getAttribute("data-tag");
        view.querySelectorAll(".feed__item").forEach(function (el) {
          el.style.display = tag === "All" || el.getAttribute("data-tag") === tag ? "" : "none";
        });
      });
    });
    view.querySelectorAll(".feed__item").forEach(function (el) {
      el.addEventListener("click", function () {
        var n = SP.notices.filter(function (x) { return x.title === el.querySelector(".feed__title").textContent; })[0];
        if (!n) return;
        SP.modal({ title: n.title,
          body: `<div class="row row--tight"><span class="badge badge--info">${esc(n.tag)}</span>
            <span class="tiny muted">${n.date} · ${esc(n.audience)}</span></div>
            <p style="font-size:14px">${esc(n.body)}</p>
            <div class="strip" style="grid-template-columns:repeat(2,1fr)">
              <div class="strip__cell"><div class="strip__k">Issued by</div><div class="strip__v" style="font-size:14px">Office of the Registrar</div></div>
              <div class="strip__cell"><div class="strip__k">Action needed</div><div class="strip__v" style="font-size:14px">${n.tag === "Fees" ? "Pay by 30 Nov" : "Note the date"}</div></div></div>`,
          actions: `<button class="btn btn--ghost" data-close>Close</button>
                    ${n.tag === "Fees" ? '<button class="btn btn--primary" data-confirm>Open fees page</button>' : ""}`,
          onConfirm: function () { location.hash = "#/fees"; } });
      });
    });
    var sub = view.querySelector('[data-action="subscribe"]');
    if (sub) sub.addEventListener("click", function () {
      SP.modal({ title: "Email alerts", body: `<div class="field"><label>Send notices to</label>
        <input class="input" value="${esc(SP.student.email)}"></div>
        <label class="check"><input type="checkbox" checked>Exams and timetable changes</label>
        <label class="check"><input type="checkbox" checked>Fee deadlines</label>
        <label class="check"><input type="checkbox">Placement drives</label>`,
        actions: `<button class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary" data-confirm>Save preferences</button>`,
        onConfirm: function () { SP.toast("Alert preferences saved", "ok"); } });
    });
  };

  /* ══════════════ Profile ══════════════ */
  R.profile = function () {
    var s = SP.student;
    function row(label, value, key) {
      return `<div class="row row--between" style="padding:11px 0;border-bottom:1px solid var(--border)" data-field="${key || label}">
        <span class="muted">${esc(label)}</span><strong style="text-align:right">${esc(value)}</strong></div>`;
    }
    return `
    <div class="page-head">
      <div><h1>My profile</h1><p class="page-head__sub">Verified against the admissions register on ${esc(s.joined)}</p></div>
      <div class="row">
        <button class="btn btn--outline" data-action="download-id">${icon("card")}Digital ID card</button>
        <button class="btn btn--primary" data-action="edit-profile">${icon("edit")}Edit details</button>
      </div>
    </div>

    <div class="card" style="display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center">
      <div class="avatar avatar--lg">${SP.initials(s.name)}</div>
      <div style="min-width:0">
        <div class="row row--tight"><h2>${esc(s.name)}</h2>${SP.badge("ok", s.status)}</div>
        <p class="muted" style="font-size:14px;margin-top:2px">${esc(s.program)} · Section ${esc(s.section)}</p>
        <div class="row" style="margin-top:12px">
          <span class="badge badge--neutral"><span class="badge__dot"></span>${esc(s.id)}</span>
          <span class="badge badge--neutral"><span class="badge__dot"></span>${esc(s.batch)}</span>
          <span class="badge badge--info">Sem ${s.semester}</span>
          <span class="badge badge--neutral">CGPA ${s.cgpa.toFixed(2)}</span>
        </div>
      </div>
      <div class="strip" style="grid-template-columns:repeat(2,140px)">
        <div class="strip__cell"><div class="strip__k">Credits</div><div class="strip__v num">${s.creditsEarned}</div></div>
        <div class="strip__cell"><div class="strip__k">Attendance</div><div class="strip__v num">${SP.overallAttend()}%</div></div>
        <div class="strip__cell"><div class="strip__k">Fees due</div><div class="strip__v num" style="color:var(--rose-500)">${SP.money(SP.fees.due)}</div></div>
        <div class="strip__cell"><div class="strip__k">Backlogs</div><div class="strip__v num">0</div></div>
      </div>
    </div>

    <div class="grid grid--sidebar">
      ${card("Personal details", "Some fields are locked by the admissions office", `
        ${row("Date of birth", s.dob, "dob")}
        ${row("Gender", s.gender, "gender")}
        ${row("Blood group", s.blood, "blood")}
        ${row("Phone", s.phone, "phone")}
        ${row("Email", s.email, "email")}
        ${row("Permanent address", s.address, "address")}
        ${row("Guardian contact", s.guardian, "guardian")}
        <div class="row" style="margin-top:16px">
          <button class="btn btn--sm btn--outline" data-action="verify">Verification status</button>
          <button class="btn btn--sm btn--ghost" data-action="password">Change password</button>
        </div>`)}

      ${card("Academic record", "Enrolment and supervision", `
        ${row("Programme", s.program, "prog")}
        ${row("Enrolment number", s.enrollment, "enroll")}
        ${row("Batch", s.batch, "batch")}
        ${row("Semester", "Semester " + s.semester + " of 10", "sem")}
        ${row("Faculty advisor", s.advisor, "advisor")}
        ${row("Date of joining", s.joined, "join")}
        <div class="pop__sep" style="margin:14px 0"></div>
        <div class="tiny muted">Degree completion requires ${s.creditsTotal} credits, zero arrears and ${Math.round(s.creditsEarned / s.creditsTotal * 100)}% earned so far.</div>
        <div style="margin-top:12px">${SP.barRow(Math.round(s.creditsEarned / s.creditsTotal * 100), "ok")}</div>`)}

      ${card("Documents", "Issued by the university · valid for the current academic year", [
        ["Bonafide certificate", "Issued 12 Oct 2026", "file"],
        ["Transfer certificate", "Issued 04 Aug 2023", "file"],
        ["Identity card", "Valid till 31 Jul 2027", "card"],
        ["Fee payment receipt (Instalment 2)", "RC-90455", "wallet"],
        ["Consolidated mark sheet (Sem 1–4)", "Issued 20 May 2026", "award"],
      ].map(function (d) {
        return `<div class="feed__item" style="border-bottom:1px solid var(--border)">
          <div class="feed__icon" style="--feed-c:var(--brand-500)">${icon(d[2])}</div>
          <div class="row row--between" style="width:100%">
            <div><div class="feed__title">${esc(d[0])}</div><div class="feed__meta"><span>${esc(d[1])}</span></div></div>
            <button class="btn btn--sm btn--outline" data-action="doc-dl" data-name="${esc(d[0])}">${icon("download")}Download</button>
          </div></div>`;
      }).join(""), { flush: true })}

      ${card("Notification preferences", "Choose where the portal reaches you", `
        <div class="stack" style="gap:14px">
          <label class="switch"><input type="checkbox" checked data-pref="Attendance alerts"><span class="switch__track"></span><span class="switch__label">Attendance shortage alerts</span></label>
          <label class="switch"><input type="checkbox" checked data-pref="Fee reminders"><span class="switch__track"></span><span class="switch__label">Fee due reminders</span></label>
          <label class="switch"><input type="checkbox" data-pref="Placement pings"><span class="switch__track"></span><span class="switch__label">Placement drive pings</span></label>
          <label class="switch"><input type="checkbox" checked data-pref="Exam timetable"><span class="switch__track"></span><span class="switch__label">Exam timetable changes</span></label>
          <label class="switch"><input type="checkbox" data-pref="Library"><span class="switch__track"></span><span class="switch__label">Library due-date digests</span></label>
        </div>
        <div class="tiny muted" style="margin-top:16px">Digest emails are batched at 08:00 IST.</div>`)}
    </div>`;
  };

  R["profile:mount"] = function (view) {
    var s = SP.student;
    function bind(sel, fn) { var el = view.querySelector(sel); if (el) el.addEventListener("click", fn); }

    bind('[data-action="edit-profile"]', function () {
      SP.modal({
        title: "Edit contact details",
        body: `<div class="field"><label>Phone</label><input class="input" id="pfPhone" value="${esc(s.phone)}"></div>
          <div class="field"><label>Email</label><input class="input" id="pfEmail" value="${esc(s.email)}">
            <span class="field__hint">A change here also updates your login.</span></div>
          <div class="field"><label>Permanent address</label><textarea class="textarea" id="pfAddr">${esc(s.address)}</textarea></div>
          <p class="tiny muted">Name, date of birth and enrolment number are locked. Raise a request with the admissions office to change those.</p>`,
        actions: `<button class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary" data-confirm>Save changes</button>`,
        onConfirm: function () { SP.toast("Profile updated · verification email sent", "ok"); } });
    });

    bind('[data-action="password"]', function () {
      SP.modal({ title: "Change password",
        body: `<div class="field"><label>Current password</label><input class="input" type="password" placeholder="••••••••"></div>
          <div class="field"><label>New password</label><input class="input" type="password" id="np" placeholder="At least 10 characters">
            <div class="bar" style="height:6px;margin-top:8px"><div class="bar__fill bar__fill--warn" id="npBar" style="width:0"></div></div>
            <span class="field__hint" id="npHint">Use a mix of letters, digits and symbols.</span></div>
          <div class="field"><label>Confirm new password</label><input class="input" type="password" placeholder="Repeat it"></div>`,
        actions: `<button class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary" data-confirm>Update password</button>`,
        onConfirm: function () { SP.toast("Password changed · other devices signed out", "ok"); },
        onMount: function (wrap) {
          var inp = wrap.querySelector("#np"), bar = wrap.querySelector("#npBar"), hint = wrap.querySelector("#npHint");
          inp.addEventListener("input", function () {
            var v = inp.value, score = Math.min(100, v.length * 8 + (/[A-Z]/.test(v) ? 15 : 0) + (/\d/.test(v) ? 15 : 0) + (/[^A-Za-z0-9]/.test(v) ? 25 : 0));
            bar.style.width = score + "%";
            bar.className = "bar__fill " + (score > 70 ? "bar__fill--ok" : score > 40 ? "bar__fill--warn" : "bar__fill--bad");
            hint.textContent = score > 70 ? "Strong enough." : score > 40 ? "Add a symbol or digit." : "Too short.";
          });
        } });
    });

    bind('[data-action="verify"]', function () {
      SP.modal({ title: "Verification status", body: `
        <div class="steps">
          <div class="step step--done"><div class="step__dot">${icon("check")}</div><div><div class="step__title">Aadhaar matched</div><div class="step__text">Cleared 06 Aug 2023</div></div></div>
          <div class="step step--done"><div class="step__dot">${icon("check")}</div><div><div class="step__title">12th certificate</div><div class="step__text">Cleared 09 Aug 2023</div></div></div>
          <div class="step step--done"><div class="step__dot">${icon("check")}</div><div><div class="step__title">Income certificate</div><div class="step__text">Renewed 18 Sep 2026</div></div></div>
          <div class="step step--live"><div class="step__dot">1</div><div><div class="step__title">Migration letter</div><div class="step__text">Awaiting the regional office · follow up by 30 Nov</div></div></div>
        </div>`, actions: `<button class="btn btn--primary" data-close>Close</button>` });
    });

    bind('[data-action="download-id"]', function () { SP.toast("Digital ID card saved to your device", "ok"); });

    view.querySelectorAll('[data-action="doc-dl"]').forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        SP.toast(b.getAttribute("data-name") + " downloaded", "ok");
      });
    });
    view.querySelectorAll("[data-pref]").forEach(function (sw) {
      sw.addEventListener("change", function () {
        SP.toast(sw.getAttribute("data-pref") + (sw.checked ? " turned on" : " turned off"), "info");
      });
    });
  };
})();
